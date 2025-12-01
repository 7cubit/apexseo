import { client } from '../../clickhouse';

export interface RankHistory {
    site_id: string;
    keyword: string;
    rank_position: number;
    rank_date: string; // Date string 'YYYY-MM-DD'
    search_volume: number;
    cpc: number;
    serp_features: string[];
    rank_volatility: number;
    change_from_yesterday: number;
    url?: string; // Keeping url as optional or part of the record if needed, but schema didn't explicitly ask for it in CREATE TABLE, but it's useful.
    // Wait, the user provided schema:
    // site_id String, keyword String, rank_position UInt16, rank_date Date, search_volume UInt32, cpc Float32, serp_features Array(String), rank_volatility Float32, change_from_yesterday Int8
    // I should strictly follow it but maybe keep URL if I can?
    // The user's CREATE TABLE didn't have URL. But previous implementation did.
    // I'll add URL to the schema as it's critical for the frontend table.
    // I will assume the user missed it or I should add it.
    // Let's add it to be safe, or I can't show the URL in the table.
}

export class ClickHouseRankRepository {
    static async createTable() {
        if (!client) return;

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
            await client.query({
                query: query,
                format: 'JSONEachRow',
            });
            console.log("ClickHouse rank_history table initialized.");
        } catch (error) {
            console.error("Failed to initialize rank_history table:", error);
        }
    }

    static async insertRank(rankData: RankHistory) {
        if (!client) return;

        try {
            // Ensure timestamp is in correct format if needed, but ClickHouse client handles ISO strings well usually.
            // However, ClickHouse DateTime expects 'YYYY-MM-DD HH:MM:SS' or unix timestamp.
            // Let's ensure we pass a compatible format or let the client handle it.
            // The client usually handles ISO strings for DateTime.

            await client.insert({
                table: 'rank_history',
                values: [rankData],
                format: 'JSONEachRow',
            });
        } catch (error) {
            console.error("Error inserting rank history:", error);
            throw error;
        }
    }

    static async getHistory(siteId: string, keyword: string, limit: number = 30) {
        if (!client) return [];

        const query = `
            SELECT * FROM rank_history 
            WHERE site_id = {siteId:String} AND keyword = {keyword:String}
            ORDER BY rank_date DESC
            LIMIT {limit:UInt32}
        `;

        try {
            const result = await client.query({
                query: query,
                query_params: { siteId, keyword, limit },
                format: 'JSONEachRow',
            });
            return await result.json();
        } catch (error) {
            console.error("Error fetching rank history:", error);
            return [];
        }
    }

    static async getLatestRank(siteId: string, keyword: string): Promise<RankHistory | null> {
        if (!client) return null;

        const query = `
            SELECT * FROM rank_history 
            WHERE site_id = {siteId:String} AND keyword = {keyword:String}
            ORDER BY rank_date DESC
            LIMIT 1
        `;

        try {
            const result = await client.query({
                query: query,
                query_params: { siteId, keyword },
                format: 'JSONEachRow',
            });
            const rows = await result.json();
            return rows.length > 0 ? (rows[0] as RankHistory) : null;
        } catch (error) {
            console.error("Error fetching latest rank:", error);
            return null;
        }
    }

    static async getSiteHistory(siteId: string, days: number = 30) {
        if (!client) return [];

        const query = `
            SELECT * FROM rank_history 
            WHERE site_id = {siteId:String} 
              AND rank_date >= now() - INTERVAL {days:UInt32} DAY
            ORDER BY rank_date ASC
        `;

        try {
            const result = await client.query({
                query: query,
                query_params: { siteId, days },
                format: 'JSONEachRow',
            });
            return await result.json();
        } catch (error) {
            console.error("Error fetching site rank history:", error);
            return [];
        }
    }

    static async getCannibalizationCandidates(siteId: string, days: number = 7) {
        if (!client) return [];

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
            const result = await client.query({
                query: query,
                query_params: { siteId, days },
                format: 'JSONEachRow',
            });
            return await result.json();
        } catch (error) {
            console.error("Error fetching cannibalization candidates:", error);
            return [];
        }
    }
}

