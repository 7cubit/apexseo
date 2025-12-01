"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClickHouseRankRepository = void 0;
const clickhouse_1 = require("../../clickhouse");
class ClickHouseRankRepository {
    static async createTable() {
        if (!clickhouse_1.client)
            return;
        const query = `
        CREATE TABLE IF NOT EXISTS rank_history (
            site_id String,
            keyword String,
            rank_position UInt16,
            rank_date Date,
            search_volume UInt32,
            cpc Float32,
            serp_features Array(String),
            rank_volatility Float32,
            change_from_yesterday Int8,
            url String
        ) ENGINE = MergeTree()
        ORDER BY (site_id, keyword, rank_date)
        `;
        try {
            await clickhouse_1.client.query({
                query: query,
                format: 'JSONEachRow',
            });
            console.log("ClickHouse rank_history table initialized.");
        }
        catch (error) {
            console.error("Failed to initialize rank_history table:", error);
        }
    }
    static async insertRank(rankData) {
        if (!clickhouse_1.client)
            return;
        try {
            // Ensure timestamp is in correct format if needed, but ClickHouse client handles ISO strings well usually.
            // However, ClickHouse DateTime expects 'YYYY-MM-DD HH:MM:SS' or unix timestamp.
            // Let's ensure we pass a compatible format or let the client handle it.
            // The client usually handles ISO strings for DateTime.
            await clickhouse_1.client.insert({
                table: 'rank_history',
                values: [rankData],
                format: 'JSONEachRow',
            });
        }
        catch (error) {
            console.error("Error inserting rank history:", error);
            throw error;
        }
    }
    static async getHistory(siteId, keyword, limit = 30) {
        if (!clickhouse_1.client)
            return [];
        const query = `
            SELECT * FROM rank_history 
            WHERE site_id = {siteId:String} AND keyword = {keyword:String}
            ORDER BY rank_date DESC
            LIMIT {limit:UInt32}
        `;
        try {
            const result = await clickhouse_1.client.query({
                query: query,
                query_params: { siteId, keyword, limit },
                format: 'JSONEachRow',
            });
            return await result.json();
        }
        catch (error) {
            console.error("Error fetching rank history:", error);
            return [];
        }
    }
    static async getLatestRank(siteId, keyword) {
        if (!clickhouse_1.client)
            return null;
        const query = `
            SELECT * FROM rank_history 
            WHERE site_id = {siteId:String} AND keyword = {keyword:String}
            ORDER BY rank_date DESC
            LIMIT 1
        `;
        try {
            const result = await clickhouse_1.client.query({
                query: query,
                query_params: { siteId, keyword },
                format: 'JSONEachRow',
            });
            const rows = await result.json();
            return rows.length > 0 ? rows[0] : null;
        }
        catch (error) {
            console.error("Error fetching latest rank:", error);
            return null;
        }
    }
    static async getSiteHistory(siteId, days = 30) {
        if (!clickhouse_1.client)
            return [];
        const query = `
            SELECT * FROM rank_history 
            WHERE site_id = {siteId:String} 
              AND rank_date >= now() - INTERVAL {days:UInt32} DAY
            ORDER BY rank_date ASC
        `;
        try {
            const result = await clickhouse_1.client.query({
                query: query,
                query_params: { siteId, days },
                format: 'JSONEachRow',
            });
            return await result.json();
        }
        catch (error) {
            console.error("Error fetching site rank history:", error);
            return [];
        }
    }
    static async getCannibalizationCandidates(siteId, days = 7) {
        if (!clickhouse_1.client)
            return [];
        // We use url as the unique identifier for a page
        // Best rank is MIN(rank_position) (e.g. 1 is better than 10)
        // Worst rank is MAX(rank_position)
        const query = `
            SELECT
                keyword,
                COUNT(DISTINCT url) as competing_pages,
                groupArray(DISTINCT url) as urls,
                round(avg(rank_position), 0) as avg_rank,
                min(rank_position) as best_rank,
                max(rank_position) as worst_rank
            FROM rank_history
            WHERE site_id = {siteId:String} AND rank_date >= now() - INTERVAL {days:UInt32} DAY
            GROUP BY keyword
            HAVING competing_pages > 1
            ORDER BY competing_pages DESC
        `;
        try {
            const result = await clickhouse_1.client.query({
                query: query,
                query_params: { siteId, days },
                format: 'JSONEachRow',
            });
            return await result.json();
        }
        catch (error) {
            console.error("Error fetching cannibalization candidates:", error);
            return [];
        }
    }
}
exports.ClickHouseRankRepository = ClickHouseRankRepository;
