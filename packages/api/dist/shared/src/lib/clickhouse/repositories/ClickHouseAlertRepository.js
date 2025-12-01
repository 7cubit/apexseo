"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClickHouseAlertRepository = void 0;
const client_1 = require("../../client");
class ClickHouseAlertRepository {
    static async createTable() {
        if (!client_1.client)
            return;
        await client_1.client.command({
            query: `
                CREATE TABLE IF NOT EXISTS alerts (
                    site_id String,
                    type String,
                    severity String,
                    message String,
                    details String,
                    status String,
                    created_at DateTime DEFAULT now()
                ) ENGINE = MergeTree()
                ORDER BY (site_id, created_at DESC)
            `
        });
    }
    static async createAlert(alert) {
        if (!client_1.client)
            return;
        await client_1.client.insert({
            table: 'alerts',
            values: [{
                    ...alert,
                    created_at: alert.created_at || new Date().toISOString().replace('T', ' ').split('.')[0]
                }],
            format: 'JSONEachRow',
        });
    }
    static async getAlerts(siteId, status) {
        if (!client_1.client)
            return [];
        const query = status
            ? `SELECT * FROM alerts WHERE site_id = {siteId:String} AND status = {status:String} ORDER BY created_at DESC LIMIT 100`
            : `SELECT * FROM alerts WHERE site_id = {siteId:String} ORDER BY created_at DESC LIMIT 100`;
        const result = await client_1.client.query({
            query,
            query_params: status ? { siteId, status } : { siteId },
            format: 'JSONEachRow',
        });
        return await result.json();
    }
    static async updateAlertStatus(siteId, alertId, status) {
        if (!client_1.client)
            return;
        // Note: ClickHouse mutations are heavy, use sparingly
        await client_1.client.command({
            query: `
                ALTER TABLE alerts 
                UPDATE status = {status:String} 
                WHERE site_id = {siteId:String} 
                AND toString(created_at) = {alertId:String}
            `,
            query_params: { siteId, alertId, status }
        });
    }
}
exports.ClickHouseAlertRepository = ClickHouseAlertRepository;
