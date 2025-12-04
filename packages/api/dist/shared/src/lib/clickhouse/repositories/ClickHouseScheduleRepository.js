"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClickHouseScheduleRepository = void 0;
const client_1 = require("../client");
class ClickHouseScheduleRepository {
    static async createTable() {
        if (!client_1.client)
            return;
        await client_1.client.command({
            query: `
                CREATE TABLE IF NOT EXISTS schedules (
                    project_id String,
                    agent_name String,
                    cron_expression String,
                    enabled UInt8,
                    last_run DateTime,
                    next_run DateTime
                ) ENGINE = MergeTree()
                ORDER BY (project_id, agent_name)
            `
        });
    }
    static async getSchedules(projectId) {
        if (!client_1.client) {
            console.log('ClickHouse client not initialized');
            return [];
        }
        console.log(`Fetching schedules for project: ${projectId}`);
        try {
            const result = await client_1.client.query({
                query: `SELECT * FROM schedules WHERE project_id = {projectId:String}`,
                query_params: { projectId },
            });
            const data = await result.json();
            console.log('Schedules fetched:', data.data);
            return data.data;
        }
        catch (e) {
            console.error('Error fetching schedules:', e);
            throw e;
        }
    }
    static async updateSchedule(schedule) {
        if (!client_1.client)
            return;
        // Delete existing and insert new (simpler than ALTER UPDATE for this use case)
        await client_1.client.command({
            query: `
                ALTER TABLE schedules 
                DELETE WHERE project_id = {projectId:String} AND agent_name = {agentName:String}
            `,
            query_params: { projectId: schedule.project_id, agentName: schedule.agent_name }
        });
        await client_1.client.insert({
            table: 'schedules',
            values: [{
                    ...schedule,
                    enabled: schedule.enabled ? 1 : 0,
                    last_run: schedule.last_run || new Date().toISOString().replace('T', ' ').split('.')[0],
                    next_run: schedule.next_run || new Date().toISOString().replace('T', ' ').split('.')[0]
                }],
            format: 'JSONEachRow',
        });
    }
    static async toggleSchedule(projectId, agentName, enabled) {
        if (!client_1.client)
            return;
        await client_1.client.command({
            query: `
                ALTER TABLE schedules 
                UPDATE enabled = {enabled:UInt8} 
                WHERE project_id = {projectId:String} AND agent_name = {agentName:String}
            `,
            query_params: { projectId, agentName, enabled: enabled ? 1 : 0 }
        });
    }
}
exports.ClickHouseScheduleRepository = ClickHouseScheduleRepository;
