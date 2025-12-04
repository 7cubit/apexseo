
import { client } from '../client';

export interface ScoreRecord {
    project_id: string;
    url: string;
    composite_score: number;
    tspr_score: number;
    depth_score: number;
    ux_score: number;
    risk_score: number;
    created_at: string;
}

export class ClickHouseScoreRepository {
    static async createTable() {
        if (!client) return;

        await client.command({
            query: `
                CREATE TABLE IF NOT EXISTS score_history (
                    project_id String,
                    url String,
                    composite_score Float32,
                    tspr_score Float32,
                    depth_score Float32,
                    ux_score Float32,
                    risk_score Float32,
                    created_at DateTime DEFAULT now()
                ) ENGINE = MergeTree()
                ORDER BY (project_id, url, created_at)
            `
        });
    }

    static async addScore(record: ScoreRecord) {
        if (!client) return;

        await client.insert({
            table: 'score_history',
            values: [{
                ...record,
                created_at: record.created_at.replace('T', ' ').split('.')[0]
            }],
            format: 'JSONEachRow'
        });
    }

    static async getLatestScores(projectId: string, limit: number = 100): Promise<ScoreRecord[]> {
        if (!client) return [];

        const result = await client.query({
            query: `
                SELECT * FROM score_history 
                WHERE project_id = {projectId:String}
                ORDER BY created_at DESC
                LIMIT {limit:UInt32}
            `,
            query_params: { projectId, limit },
            format: 'JSONEachRow'
        });

        return await result.json() as ScoreRecord[];
    }
}
