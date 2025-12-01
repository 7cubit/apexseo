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
                    embedding Array(Float32)
                ) ENGINE = MergeTree()
                ORDER BY (site_id, page_id)
            `
        });

        // Ensure content_score column exists (for existing tables)
        try {
            await client.command({
                query: `ALTER TABLE pages ADD COLUMN IF NOT EXISTS content_score Float32`
            });
        } catch (e) {
            // Ignore if column exists or other error
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
}
