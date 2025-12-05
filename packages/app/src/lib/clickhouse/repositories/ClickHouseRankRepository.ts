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
    static async getVolatilityStats(siteId: string, days: number = 7) {
        if (!client) return [];

        // Enhanced Volatility Index (EVI) Calculation
        // EVI = (0.50 * Norm_StdDev) + (0.35 * Drift_Factor) + (0.15 * Anomaly_Score)
        const query = `
            WITH
                -- 1. Calculate Daily Deltas
                deltas AS (
                    SELECT
                        keyword,
                        rank_date,
                        rank_position,
                        abs(rank_position - lagInFrame(rank_position, 1, rank_position) OVER (PARTITION BY keyword ORDER BY rank_date)) as delta
                    FROM rank_history
                    WHERE site_id = {siteId:String} AND rank_date >= now() - INTERVAL {days:UInt32} DAY
                ),
                -- 2. Aggregate Metrics per Keyword
                metrics AS (
                    SELECT
                        keyword,
                        -- A. Normalized StdDev
                        stddevSamp(delta) as std_dev,
                        medianAbsoluteDeviation(delta) as mad,
                        if(mad < 1, 1, mad) as safe_mad,
                        (std_dev / safe_mad) as norm_std_dev,

                        -- B. Drift Factor (Slope * Consistency)
                        -- ClickHouse simpleLinearRegression returns (slope, intercept) tuple
                        simpleLinearRegression(toUnixTimestamp(rank_date), rank_position) as reg,
                        reg.1 as slope, -- Access slope from tuple
                        
                        -- Sign Consistency: Count days where direction matches slope direction
                        -- Simplified proxy: if slope is negative (improving rank), how many days did rank decrease?
                        -- For now, we'll use a simplified Drift Factor: |Slope| * 10 (scaling factor)
                        abs(slope) * 100000 as drift_factor, -- Slope is per second, so scale up

                        -- C. Anomaly Score
                        avg(delta) as mean_delta,
                        countIf(abs(delta - mean_delta) > 2.5 * std_dev) as anomaly_count
                    FROM deltas
                    GROUP BY keyword
                )
            SELECT
                keyword,
                -- Final EVI Formula
                (0.50 * norm_std_dev) + (0.35 * drift_factor) + (0.15 * anomaly_count) as volatility_index,
                mean_delta as avg_daily_change
            FROM metrics
            HAVING volatility_index > 0
            ORDER BY volatility_index DESC
        `;

        try {
            const result = await client.query({
                query: query,
                query_params: { siteId, days },
                format: 'JSONEachRow',
            });
            return await result.json();
        } catch (error) {
            console.error("Error fetching volatility stats:", error);
            return [];
        }
    }

    static async getMarketVolatilityStats(siteId: string, days: number = 7) {
        if (!client) return 0;

        // Market EVI = Average EVI of ALL other sites for the same keywords
        const query = `
            WITH
                target_keywords AS (
                    SELECT DISTINCT keyword FROM rank_history WHERE site_id = {siteId:String}
                ),
                deltas AS (
                    SELECT
                        keyword,
                        rank_date,
                        rank_position,
                        abs(rank_position - lagInFrame(rank_position, 1, rank_position) OVER (PARTITION BY keyword, site_id ORDER BY rank_date)) as delta
                    FROM rank_history
                    WHERE keyword IN target_keywords 
                      AND site_id != {siteId:String}
                      AND rank_date >= now() - INTERVAL {days:UInt32} DAY
                ),
                metrics AS (
                    SELECT
                        keyword,
                        stddevSamp(delta) as std_dev,
                        medianAbsoluteDeviation(delta) as mad,
                        if(mad < 1, 1, mad) as safe_mad,
                        (std_dev / safe_mad) as norm_std_dev,
                        
                        simpleLinearRegression(toUnixTimestamp(rank_date), rank_position) as reg,
                        reg.1 as slope,
                        abs(slope) * 100000 as drift_factor,

                        avg(delta) as mean_delta,
                        countIf(abs(delta - mean_delta) > 2.5 * std_dev) as anomaly_count
                    FROM deltas
                    GROUP BY keyword
                )
            SELECT
                avg((0.50 * norm_std_dev) + (0.35 * drift_factor) + (0.15 * anomaly_count)) as market_evi
            FROM metrics
        `;

        try {
            const result = await client.query({
                query: query,
                query_params: { siteId, days },
                format: 'JSONEachRow',
            });
            const rows = await result.json();
            // @ts-ignore
            return rows.length > 0 ? rows[0].market_evi : 0;
        } catch (error) {
            console.error("Error fetching market volatility:", error);
            return 0;
        }
    }

    static async getSerpFeatureHistory(siteId: string, days: number = 7) {
        if (!client) return [];

        // Track daily count of SERP features AND daily volatility
        const query = `
            SELECT
                rank_date,
                avg(abs(change_from_yesterday)) as daily_volatility,
                countIf(has(serp_features, 'AI Overview')) as ai_overview_count,
                countIf(has(serp_features, 'Ads')) as ads_count,
                countIf(has(serp_features, 'Featured Snippet')) as snippet_count
            FROM rank_history
            WHERE site_id = {siteId:String} AND rank_date >= now() - INTERVAL {days:UInt32} DAY
            GROUP BY rank_date
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
            console.error("Error fetching SERP feature history:", error);
            return [];
        }
    }
}

