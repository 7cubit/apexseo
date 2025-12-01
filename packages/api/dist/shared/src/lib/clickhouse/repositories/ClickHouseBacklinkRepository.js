"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClickHouseBacklinkRepository = void 0;
const clickhouse_1 = require("../../clickhouse");
class ClickHouseBacklinkRepository {
    static async createTable() {
        if (!clickhouse_1.client)
            return;
        const query = `
        CREATE TABLE IF NOT EXISTS backlinks (
            site_id String,
            referring_domain String,
            backlink_url String,
            target_url String,
            anchor_text String,
            is_dofollow UInt8,
            spam_score Float32,
            date_found Date,
            domain_relevance Float32
        ) ENGINE = MergeTree()
        ORDER BY (site_id, referring_domain)
        `;
        try {
            await clickhouse_1.client.query({
                query: query,
                format: 'JSONEachRow',
            });
            console.log("ClickHouse backlinks table initialized.");
        }
        catch (error) {
            console.error("Failed to initialize backlinks table:", error);
        }
    }
    static async insertBacklinks(backlinks) {
        if (!clickhouse_1.client || backlinks.length === 0)
            return;
        try {
            // Convert boolean to UInt8 for ClickHouse
            const values = backlinks.map(b => ({
                ...b,
                is_dofollow: b.is_dofollow ? 1 : 0
            }));
            await clickhouse_1.client.insert({
                table: 'backlinks',
                values: values,
                format: 'JSONEachRow',
            });
        }
        catch (error) {
            console.error("Error inserting backlinks:", error);
            throw error;
        }
    }
    static async getBacklinks(siteId, limit = 100) {
        if (!clickhouse_1.client)
            return [];
        const query = `
            SELECT * FROM backlinks 
            WHERE site_id = {siteId:String}
            ORDER BY date_found DESC
            LIMIT {limit:UInt32}
        `;
        try {
            const result = await clickhouse_1.client.query({
                query: query,
                query_params: { siteId, limit },
                format: 'JSONEachRow',
            });
            return await result.json();
        }
        catch (error) {
            console.error("Error fetching backlinks:", error);
            return [];
        }
    }
    static async getReferringDomains(siteId) {
        if (!clickhouse_1.client)
            return [];
        const query = `
            SELECT 
                referring_domain,
                count() as backlink_count,
                avg(spam_score) as avg_spam_score,
                avg(domain_relevance) as avg_relevance
            FROM backlinks
            WHERE site_id = {siteId:String}
            GROUP BY referring_domain
            ORDER BY backlink_count DESC
            LIMIT 50
        `;
        try {
            const result = await clickhouse_1.client.query({
                query: query,
                query_params: { siteId },
                format: 'JSONEachRow',
            });
            return await result.json();
        }
        catch (error) {
            console.error("Error fetching referring domains:", error);
            return [];
        }
    }
    static async getStats(siteId) {
        if (!clickhouse_1.client)
            return null;
        const query = `
            SELECT 
                uniq(referring_domain) as total_domains,
                count() as total_backlinks,
                sum(is_dofollow) as dofollow_count,
                avg(domain_relevance) as avg_relevance,
                avg(spam_score) as avg_spam_score
            FROM backlinks
            WHERE site_id = {siteId:String}
        `;
        try {
            const result = await clickhouse_1.client.query({
                query: query,
                query_params: { siteId },
                format: 'JSONEachRow',
            });
            const rows = await result.json();
            return rows.length > 0 ? rows[0] : null;
        }
        catch (error) {
            console.error("Error fetching backlink stats:", error);
            return null;
        }
    }
}
exports.ClickHouseBacklinkRepository = ClickHouseBacklinkRepository;
