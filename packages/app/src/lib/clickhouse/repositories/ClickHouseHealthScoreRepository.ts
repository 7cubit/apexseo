import { client } from '../../clickhouse';

export interface PageHealthScore {
    site_id: string;
    page_id: string;
    health_score: number;
    tspr_component: number;
    content_component: number;
    ux_component: number;
    truth_component: number;
    backlink_component: number;
    link_health_component: number;
    score_date: string; // YYYY-MM-DD
}

export class ClickHouseHealthScoreRepository {
    static async createTable() {
        if (!client) return;

        const query = `
        CREATE TABLE IF NOT EXISTS page_health_scores (
            site_id String,
            page_id String,
            health_score Float32,
            tspr_component Float32,
            content_component Float32,
            ux_component Float32,
            truth_component Float32,
            backlink_component Float32,
            link_health_component Float32,
            score_date Date
        ) ENGINE = MergeTree()
        ORDER BY (site_id, page_id, score_date)
        `;

        try {
            await client.query({
                query: query,
                format: 'JSONEachRow',
            });
            console.log("ClickHouse page_health_scores table initialized.");
        } catch (error) {
            console.error("Failed to initialize page_health_scores table:", error);
        }
    }

    static async saveScores(scores: PageHealthScore[]) {
        if (!client || scores.length === 0) return;

        try {
            await client.insert({
                table: 'page_health_scores',
                values: scores,
                format: 'JSONEachRow',
            });
        } catch (error) {
            console.error("Error inserting health scores:", error);
            throw error;
        }
    }

    static async getLatestScores(siteId: string) {
        if (!client) return [];

        // Get the latest score for each page
        const query = `
            SELECT * FROM page_health_scores
            WHERE site_id = {siteId:String}
            ORDER BY score_date DESC
            LIMIT 1 BY page_id
        `;

        try {
            const result = await client.query({
                query: query,
                query_params: { siteId },
                format: 'JSONEachRow',
            });
            return await result.json();
        } catch (error) {
            console.error("Error fetching latest health scores:", error);
            return [];
        }
    }

    static async getHistory(siteId: string, days: number = 30) {
        if (!client) return [];

        const query = `
            SELECT 
                score_date,
                avg(health_score) as avg_health_score
            FROM page_health_scores
            WHERE site_id = {siteId:String} AND score_date >= now() - INTERVAL {days:UInt32} DAY
            GROUP BY score_date
            ORDER BY score_date ASC
        `;

        try {
            const result = await client.query({
                query: query,
                query_params: { siteId, days },
                format: 'JSONEachRow',
            });
            return await result.json();
        } catch (error) {
            console.error("Error fetching health score history:", error);
            return [];
        }
    }
}
