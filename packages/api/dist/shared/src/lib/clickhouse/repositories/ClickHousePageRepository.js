"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClickHousePageRepository = void 0;
const clickhouse_1 = require("../../clickhouse");
class ClickHousePageRepository {
    static async createSite(site) {
        if (!clickhouse_1.client)
            return;
        await clickhouse_1.client.insert({
            table: 'sites',
            values: [site],
            format: 'JSONEachRow',
        });
    }
    static async createTable() {
        if (!clickhouse_1.client)
            return;
        try {
            await clickhouse_1.client.command({
                query: `
                CREATE TABLE IF NOT EXISTS pages (
                    site_id String,
                    page_id String,
                    url String,
                    title String,
                    h1 String,
                    content String,
                    word_count UInt32,
                    status String,
                    crawled_at DateTime,
                    content_score Float32,
                    is_orphan UInt8,
                    canonical_id String,
                    link_count_internal UInt32,
                    link_count_external UInt32,
                    keywords Array(String),
                    tspr Float32,
                    embedding Array(Float32),
                    cluster_id UInt32
                ) ENGINE = MergeTree()
                ORDER BY (site_id, crawled_at)
                `
            });
            console.log("ClickHouse pages table initialized.");
        }
        catch (error) {
            console.error("Failed to create pages table:", error);
        }
    }
    static async createPage(page) {
        if (!clickhouse_1.client)
            return;
        try {
            await clickhouse_1.client.insert({
                table: 'pages',
                values: [{
                        ...page,
                        // Ensure defaults if missing
                        content: page.content || '',
                        word_count: page.word_count || 0,
                        status: page.status || '200',
                        crawled_at: page.crawled_at || new Date().toISOString().replace('T', ' ').split('.')[0],
                        content_score: page.content_score || 0,
                        is_orphan: page.is_orphan || 0,
                        link_count_internal: page.link_count_internal || 0,
                        link_count_external: page.link_count_external || 0,
                        keywords: page.keywords || []
                    }],
                format: 'JSONEachRow',
            });
        }
        catch (error) {
            console.error("Error creating page:", error);
            throw error;
        }
    }
    static async getPagesBySite(siteId) {
        if (!clickhouse_1.client)
            return [];
        const result = await clickhouse_1.client.query({
            query: `SELECT * FROM pages WHERE site_id = {siteId:String}`,
            query_params: { siteId },
            format: 'JSONEachRow',
        });
        return await result.json();
    }
    static async getPageById(pageId) {
        if (!clickhouse_1.client)
            return null;
        const result = await clickhouse_1.client.query({
            query: `SELECT * FROM pages WHERE page_id = {pageId:String} LIMIT 1`,
            query_params: { pageId },
            format: 'JSONEachRow',
        });
        const rows = await result.json();
        return rows.length > 0 ? rows[0] : null;
    }
    static async getPageIdByUrl(siteId, url) {
        if (!clickhouse_1.client)
            return null;
        const result = await clickhouse_1.client.query({
            query: `SELECT page_id FROM pages WHERE site_id = {siteId:String} AND url = {url:String} LIMIT 1`,
            query_params: { siteId, url },
            format: 'JSONEachRow',
        });
        const rows = await result.json();
        return rows.length > 0 ? rows[0].page_id : null;
    }
    static async getSemanticOrphans(siteId) {
        if (!clickhouse_1.client)
            return [];
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
        const result = await clickhouse_1.client.query({
            query,
            query_params: { siteId },
            format: 'JSONEachRow',
        });
        return await result.json();
    }
    static async updateOrphanStatus(siteId, pageIds, isOrphan) {
        if (!clickhouse_1.client || pageIds.length === 0)
            return;
        // Use ALTER TABLE UPDATE
        // Note: mutations in ClickHouse are heavy, use sparingly or batch.
        const val = isOrphan ? 1 : 0;
        const formattedIds = pageIds.map(id => `'${id}'`).join(',');
        try {
            await clickhouse_1.client.command({
                query: `ALTER TABLE pages UPDATE is_orphan = ${val} WHERE site_id = {siteId:String} AND page_id IN (${formattedIds})`,
                query_params: { siteId }
            });
        }
        catch (error) {
            console.error("Error updating orphan status:", error);
        }
    }
    static async getOrphanPages(siteId) {
        if (!clickhouse_1.client)
            return [];
        const result = await clickhouse_1.client.query({
            query: `SELECT * FROM pages WHERE site_id = {siteId:String} AND is_orphan = 1`,
            query_params: { siteId },
            format: 'JSONEachRow',
        });
        return await result.json();
    }
    static async getProjectOverview(domain) {
        if (!clickhouse_1.client)
            return { totalPages: 0, avgContentScore: 0, lastCrawl: null };
        const result = await clickhouse_1.client.query({
            query: `
                SELECT 
                    count() as totalPages,
                    avg(content_score) as avgContentScore,
                    max(crawled_at) as lastCrawl
                FROM pages
                WHERE site_id = {domain:String}
            `,
            query_params: { domain },
            format: 'JSONEachRow'
        });
        const rows = await result.json();
        const row = rows[0];
        return {
            totalPages: row.totalPages,
            avgContentScore: row.avgContentScore,
            lastCrawl: row.lastCrawl
        };
    }
    static async getPages(domain, limit, offset) {
        if (!clickhouse_1.client)
            return { pages: [], total: 0 };
        const [pagesResult, countResult] = await Promise.all([
            clickhouse_1.client.query({
                query: `
                    SELECT * FROM pages 
                    WHERE site_id = {domain:String}
                    ORDER BY crawled_at DESC
                    LIMIT {limit:UInt32} OFFSET {offset:UInt32}
                `,
                query_params: { domain, limit, offset },
                format: 'JSONEachRow'
            }),
            clickhouse_1.client.query({
                query: `SELECT count() as total FROM pages WHERE site_id = {domain:String}`,
                query_params: { domain },
                format: 'JSONEachRow'
            })
        ]);
        const pages = await pagesResult.json();
        const countRows = await countResult.json();
        return {
            pages,
            total: countRows[0].total
        };
    }
    static async getPageAudit(domain, pageId) {
        if (!clickhouse_1.client)
            return null;
        const result = await clickhouse_1.client.query({
            query: `
                SELECT * FROM pages 
                WHERE site_id = {domain:String} AND page_id = {pageId:String}
                LIMIT 1
            `,
            query_params: { domain, pageId },
            format: 'JSONEachRow'
        });
        const rows = await result.json();
        return rows.length > 0 ? rows[0] : null;
    }
}
exports.ClickHousePageRepository = ClickHousePageRepository;
