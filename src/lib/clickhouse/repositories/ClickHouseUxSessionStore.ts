import { client } from '../../clickhouse';

export interface UxSession {
    session_id: string;
    site_id: string;
    persona: string;
    goal: string;
    status: 'running' | 'completed' | 'failed';
    duration: number;
    success_score: number;
    created_at?: string;
}

export interface UxEvent {
    session_id: string;
    step_number: number;
    url: string;
    action: string;
    description: string;
    timestamp?: string;
}

export class ClickHouseUxSessionStore {
    static async initialize() {
        if (!client) return;

        await client.command({
            query: `
                CREATE TABLE IF NOT EXISTS ux_sessions (
                    session_id String,
                    site_id String,
                    persona String,
                    goal String,
                    status String,
                    duration Float32,
                    success_score Float32,
                    created_at DateTime DEFAULT now()
                ) ENGINE = MergeTree()
                ORDER BY (site_id, session_id)
            `
        });

        await client.command({
            query: `
                CREATE TABLE IF NOT EXISTS ux_events (
                    session_id String,
                    step_number Int32,
                    url String,
                    action String,
                    description String,
                    timestamp DateTime DEFAULT now()
                ) ENGINE = MergeTree()
                ORDER BY (session_id, step_number)
            `
        });
    }

    static async saveSession(session: UxSession) {
        if (!client) return;
        await client.insert({
            table: 'ux_sessions',
            values: [session],
            format: 'JSONEachRow'
        });
    }

    static async updateSessionStatus(sessionId: string, status: string, successScore: number, duration: number) {
        if (!client) return;
        // ClickHouse updates are heavy (ALTER TABLE UPDATE), so for MVP we might just insert a new record or use ReplacingMergeTree.
        // For simplicity in this MVP, we'll assume we can just insert the final state if we use a different ID or just accept duplicates and take the latest.
        // However, standard SQL update:
        await client.command({
            query: `
                ALTER TABLE ux_sessions 
                UPDATE status = {status:String}, success_score = {successScore:Float32}, duration = {duration:Float32}
                WHERE session_id = {sessionId:String}
            `,
            query_params: { sessionId, status, successScore, duration }
        });
    }

    static async saveEvent(event: UxEvent) {
        if (!client) return;
        await client.insert({
            table: 'ux_events',
            values: [event],
            format: 'JSONEachRow'
        });
    }

    static async getSessionsBySite(siteId: string, limit: number = 50): Promise<UxSession[]> {
        if (!client) return [];
        const resultSet = await client.query({
            query: `
                SELECT * FROM ux_sessions 
                WHERE site_id = {siteId: String}
                ORDER BY created_at DESC
                LIMIT {limit: Int32}
            `,
            query_params: { siteId, limit }
        });
        return await resultSet.json() as unknown as UxSession[];
    }

    static async getEventsBySession(sessionId: string): Promise<UxEvent[]> {
        if (!client) return [];
        const resultSet = await client.query({
            query: `
                SELECT * FROM ux_events 
                WHERE session_id = {sessionId: String}
                ORDER BY step_number ASC
            `,
            query_params: { sessionId }
        });
        return await resultSet.json() as unknown as UxEvent[];
    }

    static async getMetrics(siteId: string) {
        if (!client) return { successRate: 0, avgClicks: 0, frictionScore: 0 };

        // Success Rate
        const successResult = await client.query({
            query: `
                SELECT 
                    countIf(success_score > 0.7) / count() as success_rate,
                    avg(duration) as avg_duration
                FROM ux_sessions
                WHERE site_id = {siteId: String} AND status = 'completed'
            `,
            query_params: { siteId }
        });
        const successRows = await successResult.json() as unknown as any[];
        const successRate = successRows.length > 0 ? successRows[0].success_rate : 0;

        // Avg Clicks (Steps)
        const clicksResult = await client.query({
            query: `
                SELECT avg(steps) as avg_steps FROM (
                    SELECT session_id, count() as steps 
                    FROM ux_events 
                    WHERE session_id IN (SELECT session_id FROM ux_sessions WHERE site_id = {siteId: String})
                    GROUP BY session_id
                )
            `,
            query_params: { siteId }
        });
        const clicksRows = await clicksResult.json() as unknown as any[];
        const avgClicks = clicksRows.length > 0 ? clicksRows[0].avg_steps : 0;

        return {
            successRate: Math.round(successRate * 100),
            avgClicks: Math.round(avgClicks),
            frictionScore: Math.round((1 - successRate) * 100) // Simple friction metric
        };
    }
}
