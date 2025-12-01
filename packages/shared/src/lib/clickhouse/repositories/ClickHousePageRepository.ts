import { client } from '../../clickhouse';

export interface Site {
    site_id: string;
    project_id: string;
    url: string;
    page_count?: number;
    link_count?: number;
}

export interface Page {
    site_id: string;
    page_id: string;
    url: string;
    status?: string;
    title?: string;
    h1?: string;
    text?: string;
    word_count?: number;
    cluster_id?: string;
    pr?: number;
    tspr?: number;
    semantic_orphan?: number;
    max_claim_risk?: number;
    high_risk_claim_count?: number;
    content_score?: number;
    is_orphan?: number; // 0 or 1
    canonical_id?: string;
    link_count_internal?: number;
    link_count_external?: number;
    keywords?: string[];
}

export class ClickHousePageRepository {
    static async createSite(site: Site) {
        if (!client) return;
        await client.insert({
            table: 'sites',
            values: [site],
            format: 'JSONEachRow',
        });
    }

    static async createTable() {
        if (!client) return;
        await client.command({
            query: `
                CREATE TABLE IF NOT EXISTS pages (
                    site_id String,
                    page_id String,
                    url String,
                    status String,
                    title String,
                    h1 String,
                    text String,
                    word_count UInt32,
                    cluster_id String,
                    pr Float32,
                    tspr Float32,
                    semantic_orphan UInt8,
                    max_claim_risk Float32,
                    high_risk_claim_count UInt32,
                    content_score Float32,
                    is_orphan UInt8,
                    canonical_id String,
                    link_count_internal UInt32,
                    link_count_external UInt32,
                    embedding Array(Float32),
                    keywords Array(String)
                ) ENGINE = MergeTree()
                ORDER BY (site_id, page_id)
            `
        });

        // Ensure new columns exist
        const columns = [
            'content_score Float32',
            'is_orphan UInt8',
            'canonical_id String',
            'link_count_internal UInt32',
            'link_count_external UInt32',
            'keywords Array(String)'
        ];

        for (const col of columns) {
            try {
                await client.command({
                    query: `ALTER TABLE pages ADD COLUMN IF NOT EXISTS ${col}`
                });
            } catch (e) {
                // Ignore
            }
        }
    }

    static async createPage(page: Page) {
        if (!client) return;
        try {
            await client.insert({
                table: 'pages',
                values: [page],
                format: 'JSONEachRow',
            });
        } catch (error) {
            console.error("Error creating page:", error);
            throw error;
        }
    }

    static async getPagesBySite(siteId: string) {
        if (!client) return [];
        const result = await client.query({
            query: `SELECT * FROM pages WHERE site_id = {siteId:String}`,
            query_params: { siteId },
            format: 'JSONEachRow',
        });
        return await result.json();
    }

    static async getPageById(pageId: string) {
        if (!client) return null;
        const result = await client.query({
            query: `SELECT * FROM pages WHERE page_id = {pageId:String} LIMIT 1`,
            query_params: { pageId },
            format: 'JSONEachRow',
        });
        const rows = await result.json();
        return rows.length > 0 ? rows[0] : null;
    }

    static async getPageIdByUrl(siteId: string, url: string): Promise<string | null> {
        if (!client) return null;
        const result = await client.query({
            query: `SELECT page_id FROM pages WHERE site_id = {siteId:String} AND url = {url:String} LIMIT 1`,
            query_params: { siteId, url },
            format: 'JSONEachRow',
        });
        const rows = await result.json();
        return rows.length > 0 ? (rows[0] as any).page_id : null;
    }

    static async getSemanticOrphans(siteId: string) {
        if (!client) return [];

        // Find pages where >70% of nearest neighbors (k=5) are in a different cluster
        const query = `
            WITH neighbors AS (
                SELECT 
                    p1.page_id as page_id,
                    p1.url as url,
                    p1.cluster_id as cluster_id,
                    p2.cluster_id as neighbor_cluster_id,
                    p2.url as neighbor_url,
                    L2Distance(p1.embedding, p2.embedding) as dist
                FROM pages p1 
                CROSS JOIN pages p2 
                WHERE p1.site_id = {siteId:String} 
                  AND p2.site_id = {siteId:String} 
                  AND p1.page_id != p2.page_id
                  AND length(p1.embedding) > 0
                  AND length(p2.embedding) > 0
                ORDER BY dist ASC
                LIMIT 5 BY page_id
            )
            SELECT 
                page_id,
                any(url) as url,
                avg(if(cluster_id != neighbor_cluster_id, 1, 0)) as isolation_score,
                groupArray(neighbor_url) as suggested_targets
            FROM neighbors
            GROUP BY page_id
            HAVING isolation_score > 0.7
            ORDER BY isolation_score DESC
            LIMIT 25
        `;

        const result = await client.query({
            query,
            query_params: { siteId },
            format: 'JSONEachRow',
        });
        return await result.json();
    }

    static async updateOrphanStatus(siteId: string, pageIds: string[], isOrphan: boolean) {
        if (!client || pageIds.length === 0) return;

        // Use ALTER TABLE UPDATE
        // Note: mutations in ClickHouse are heavy, use sparingly or batch.
        const val = isOrphan ? 1 : 0;
        const formattedIds = pageIds.map(id => `'${id}'`).join(',');

        try {
            await client.command({
                query: `ALTER TABLE pages UPDATE is_orphan = ${val} WHERE site_id = {siteId:String} AND page_id IN (${formattedIds})`,
                query_params: { siteId }
            });
        } catch (error) {
            console.error("Error updating orphan status:", error);
        }
    }

    static async getOrphanPages(siteId: string) {
        if (!client) return [];
        const result = await client.query({
            query: `SELECT * FROM pages WHERE site_id = {siteId:String} AND is_orphan = 1`,
            query_params: { siteId },
            format: 'JSONEachRow',
        });
        return await result.json();
    }
}
