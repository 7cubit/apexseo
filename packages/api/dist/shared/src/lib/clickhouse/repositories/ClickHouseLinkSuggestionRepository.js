"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClickHouseLinkSuggestionRepository = void 0;
const clickhouse_1 = require("../../clickhouse");
class ClickHouseLinkSuggestionRepository {
    static async createTable() {
        if (!clickhouse_1.client)
            return;
        await clickhouse_1.client.command({
            query: `
                CREATE TABLE IF NOT EXISTS link_suggestions (
                    site_id String,
                    source_page_id String,
                    target_page_id String,
                    source_url String,
                    target_url String,
                    similarity_score Float32,
                    tspr_diff Float32,
                    cluster_id String,
                    suggested_anchor String,
                    reason String,
                    status String,
                    created_at DateTime DEFAULT now()
                ) ENGINE = MergeTree()
                ORDER BY (site_id, similarity_score)
            `
        });
    }
    static async saveSuggestions(suggestions) {
        if (!clickhouse_1.client || suggestions.length === 0)
            return;
        await clickhouse_1.client.insert({
            table: 'link_suggestions',
            values: suggestions,
            format: 'JSONEachRow',
        });
    }
    static async getSuggestions(siteId, status = 'pending') {
        if (!clickhouse_1.client)
            return [];
        const result = await clickhouse_1.client.query({
            query: `
                SELECT * FROM link_suggestions 
                WHERE site_id = {siteId:String} AND status = {status:String}
                ORDER BY similarity_score DESC
                LIMIT 100
            `,
            query_params: { siteId, status },
            format: 'JSONEachRow',
        });
        return await result.json();
    }
    static async updateStatus(siteId, sourceId, targetId, status) {
        if (!clickhouse_1.client)
            return;
        // Note: Mutations are heavy in ClickHouse.
        await clickhouse_1.client.command({
            query: `
                ALTER TABLE link_suggestions 
                UPDATE status = {status:String} 
                WHERE site_id = {siteId:String} 
                AND source_page_id = {sourceId:String} 
                AND target_page_id = {targetId:String}
            `,
            query_params: { siteId, sourceId, targetId, status }
        });
    }
}
exports.ClickHouseLinkSuggestionRepository = ClickHouseLinkSuggestionRepository;
