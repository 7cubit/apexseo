"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClickHouseUxSessionStore = void 0;
const clickhouse_1 = require("../../clickhouse");
class ClickHouseUxSessionStore {
    static async initialize() {
        if (!clickhouse_1.client)
            return;
        await clickhouse_1.client.command({
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
        await clickhouse_1.client.command({
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
        try {
            await clickhouse_1.client.command({
                query: `ALTER TABLE ux_sessions ADD COLUMN IF NOT EXISTS success_score Float32`
            });
            await clickhouse_1.client.command({
                query: `ALTER TABLE ux_sessions ADD COLUMN IF NOT EXISTS duration Float32`
            });
            await clickhouse_1.client.command({
                query: `ALTER TABLE ux_sessions ADD COLUMN IF NOT EXISTS status String`
            });
        }
        catch (e) {
            // Ignore
        }
    }
    static async saveSession(session) {
    }
    static async updateSessionStatus(sessionId, status, successScore, duration) {
        if (!clickhouse_1.client)
            return;
        // ClickHouse updates are heavy (ALTER TABLE UPDATE), so for MVP we might just insert a new record or use ReplacingMergeTree.
        // For simplicity in this MVP, we'll assume we can just insert the final state if we use a different ID or just accept duplicates and take the latest.
        // However, standard SQL update:
        await clickhouse_1.client.command({
            query: `
                ALTER TABLE ux_sessions 
                UPDATE status = {status:String}, success_score = {successScore:Float32}, duration = {duration:Float32}
                WHERE session_id = {sessionId:String}
            `,
            query_params: { sessionId, status, successScore, duration }
        });
    }
    static async saveEvent(event) {
        if (!clickhouse_1.client)
            return;
        await clickhouse_1.client.insert({
            table: 'ux_events',
            values: [event],
            format: 'JSONEachRow'
        });
    }
    static async getSessionsBySite(siteId, limit = 50) {
        if (!clickhouse_1.client)
            return [];
        const resultSet = await clickhouse_1.client.query({
            query: `
                SELECT * FROM ux_sessions 
                WHERE site_id = {siteId: String}
                ORDER BY created_at DESC
                LIMIT {limit: Int32}
            `,
            query_params: { siteId, limit }
        });
        return await resultSet.json();
    }
    static async getEventsBySession(sessionId) {
        if (!clickhouse_1.client)
            return [];
        const resultSet = await clickhouse_1.client.query({
            query: `
                SELECT * FROM ux_events 
                WHERE session_id = {sessionId: String}
                ORDER BY step_number ASC
            `,
            query_params: { sessionId }
        });
        return await resultSet.json();
    }
    static async getMetrics(siteId) {
        if (!clickhouse_1.client)
            return { successRate: 0, avgClicks: 0, frictionScore: 0 };
        // Success Rate
        const successResult = await clickhouse_1.client.query({
            query: `
                SELECT 
                    countIf(success_score > 0.7) / count() as success_rate,
                    avg(duration) as avg_duration
                FROM ux_sessions
                WHERE site_id = {siteId: String} AND status = 'completed'
            `,
            query_params: { siteId }
        });
        const successRows = await successResult.json();
        const successRate = successRows.length > 0 ? successRows[0].success_rate : 0;
        // Avg Clicks (Steps)
        const clicksResult = await clickhouse_1.client.query({
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
        const clicksRows = await clicksResult.json();
        const avgClicks = clicksRows.length > 0 ? clicksRows[0].avg_steps : 0;
        return {
            successRate: Math.round(successRate * 100),
            avgClicks: Math.round(avgClicks),
            frictionScore: Math.round((1 - successRate) * 100) // Simple friction metric
        };
    }
}
exports.ClickHouseUxSessionStore = ClickHouseUxSessionStore;
