"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClickHouseProjectRepository = void 0;
const client_1 = require("../client");
class ClickHouseProjectRepository {
    static async createTable() {
        if (!client_1.client)
            return;
        await client_1.client.command({
            query: `
                CREATE TABLE IF NOT EXISTS projects (
                    id String,
                    name String,
                    domain String,
                    user_id String,
                    created_at DateTime,
                    site_doctor_enabled UInt8 DEFAULT 1,
                    site_doctor_cron String DEFAULT '0 2 * * *',
                    rank_tracker_enabled UInt8 DEFAULT 1,
                    rank_tracker_cron String DEFAULT '0 */6 * * *'
                ) ENGINE = MergeTree()
                ORDER BY (user_id, created_at)
            `
        });
    }
    static async create(project) {
        var _a, _b, _c, _d;
        if (!client_1.client)
            throw new Error('ClickHouse client not initialized');
        await client_1.client.insert({
            table: 'projects',
            values: [{
                    id: project.id,
                    name: project.name,
                    domain: project.domain,
                    user_id: project.user_id,
                    created_at: project.created_at,
                    site_doctor_enabled: (_a = project.site_doctor_enabled) !== null && _a !== void 0 ? _a : 1,
                    site_doctor_cron: (_b = project.site_doctor_cron) !== null && _b !== void 0 ? _b : '0 2 * * *',
                    rank_tracker_enabled: (_c = project.rank_tracker_enabled) !== null && _c !== void 0 ? _c : 1,
                    rank_tracker_cron: (_d = project.rank_tracker_cron) !== null && _d !== void 0 ? _d : '0 */6 * * *'
                }],
            format: 'JSONEachRow'
        });
        return project;
    }
    static async getByUser(userId) {
        if (!client_1.client)
            return [];
        const result = await client_1.client.query({
            query: 'SELECT * FROM projects WHERE user_id = {userId:String} ORDER BY created_at DESC',
            query_params: { userId }
        });
        const data = await result.json();
        return data.data;
    }
    static async getById(id) {
        if (!client_1.client)
            return null;
        const result = await client_1.client.query({
            query: 'SELECT * FROM projects WHERE id = {id:String} LIMIT 1',
            query_params: { id }
        });
        const data = await result.json();
        return data.data[0] || null;
    }
    static async getAll() {
        if (!client_1.client)
            return [];
        const result = await client_1.client.query({
            query: 'SELECT * FROM projects ORDER BY created_at DESC'
        });
        const data = await result.json();
        return data.data;
    }
    static async update(id, updates) {
        if (!client_1.client)
            return;
        const setClauses = Object.keys(updates)
            .map(key => `${key} = {${key}:String}`)
            .join(', ');
        await client_1.client.command({
            query: `ALTER TABLE projects UPDATE ${setClauses} WHERE id = {id:String}`,
            query_params: { id, ...updates }
        });
    }
    static async delete(id) {
        if (!client_1.client)
            return;
        await client_1.client.command({
            query: 'ALTER TABLE projects DELETE WHERE id = {id:String}',
            query_params: { id }
        });
    }
    static async getMetrics(projectId) {
        if (!client_1.client)
            return { pages: 0, errors: 0, avg_time: 0 };
        try {
            // Assuming 'pages' table has site_id which maps to project_id (or we use project_id directly if schema allows)
            // Based on schema.sql, pages table has site_id. Assuming site_id == project_id for now.
            const result = await client_1.client.query({
                query: `
                    SELECT 
                        count() as pages,
                        countIf(status != '200') as errors,
                        0 as avg_time -- Placeholder as duration is not in pages table schema
                    FROM pages
                    WHERE site_id = {projectId:String}
                `,
                query_params: { projectId },
                format: 'JSONEachRow'
            });
            const rows = await result.json();
            return rows[0] || { pages: 0, errors: 0, avg_time: 0 };
        }
        catch (error) {
            console.error('Failed to get project metrics:', error);
            return { pages: 0, errors: 0, avg_time: 0 };
        }
    }
    static async getCrawlLogs(projectId, limit = 20) {
        if (!client_1.client)
            return [];
        try {
            // Using api_usage_logs as a proxy for crawl logs for now, or we could create a dedicated crawl_logs table.
            // For this implementation, let's assume we might log crawl events to a new table or just return empty if not exists.
            // Let's return empty for now and rely on Temporal for live status, 
            // or query pages table for recent crawls.
            const result = await client_1.client.query({
                query: `
                    SELECT 
                        url, 
                        status, 
                        crawled_at as timestamp 
                    FROM pages 
                    WHERE site_id = {projectId:String} 
                    ORDER BY crawled_at DESC 
                    LIMIT {limit:UInt32}
                `,
                query_params: { projectId, limit },
                format: 'JSONEachRow'
            });
            return await result.json();
        }
        catch (error) {
            console.error('Failed to get crawl logs:', error);
            return [];
        }
    }
}
exports.ClickHouseProjectRepository = ClickHouseProjectRepository;
