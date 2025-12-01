import { client } from '../client';

export interface Alert {
    site_id: string;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    details?: string;
    status: 'new' | 'acknowledged' | 'resolved';
    created_at?: string;
}

export class ClickHouseAlertRepository {
    static async createTable() {
        if (!client) return;

        await client.command({
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

    static async createAlert(alert: Alert) {
        if (!client) return;

        await client.insert({
            table: 'alerts',
            values: [{
                ...alert,
                created_at: alert.created_at || new Date().toISOString().replace('T', ' ').split('.')[0]
            }],
            format: 'JSONEachRow',
        });
    }

    static async getAlerts(siteId: string, status?: string) {
        if (!client) return [];

        const query = status
            ? `SELECT * FROM alerts WHERE site_id = {siteId:String} AND status = {status:String} ORDER BY created_at DESC LIMIT 100`
            : `SELECT * FROM alerts WHERE site_id = {siteId:String} ORDER BY created_at DESC LIMIT 100`;

        const result = await client.query({
            query,
            query_params: status ? { siteId, status } : { siteId },
            format: 'JSONEachRow',
        });

        return await result.json();
    }

    static async updateAlertStatus(siteId: string, alertId: string, status: string) {
        if (!client) return;

        // Note: ClickHouse mutations are heavy, use sparingly
        await client.command({
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
