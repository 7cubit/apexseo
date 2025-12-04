import { client } from '../client';

export interface UsageStat {
    date: string;
    count: number;
    errors: number;
}

export interface EndpointStat {
    endpoint: string;
    count: number;
    avg_duration: number;
}

export class ClickHouseUsageRepository {
    static async getGlobalStats(days: number = 30): Promise<UsageStat[]> {
        if (!client) return [];
        try {
            const result = await client.query({
                query: `
                    SELECT
                        toDate(timestamp) as date,
                        count() as count,
                        countIf(status_code >= 400) as errors
                    FROM api_usage_logs
                    WHERE timestamp >= now() - INTERVAL {days:UInt32} DAY
                    GROUP BY date
                    ORDER BY date ASC
                `,
                query_params: { days },
                format: 'JSONEachRow'
            });
            return await result.json() as UsageStat[];
        } catch (error) {
            console.error('Failed to get global stats:', error);
            return [];
        }
    }

    static async getAccountStats(accountId: string, days: number = 30): Promise<UsageStat[]> {
        if (!client) return [];
        try {
            const result = await client.query({
                query: `
                    SELECT
                        toDate(timestamp) as date,
                        count() as count,
                        countIf(status_code >= 400) as errors
                    FROM api_usage_logs
                    WHERE account_id = {accountId:String}
                      AND timestamp >= now() - INTERVAL {days:UInt32} DAY
                    GROUP BY date
                    ORDER BY date ASC
                `,
                query_params: { accountId, days },
                format: 'JSONEachRow'
            });
            return await result.json() as UsageStat[];
        } catch (error) {
            console.error('Failed to get account stats:', error);
            return [];
        }
    }

    static async getTopEndpoints(accountId?: string, limit: number = 10): Promise<EndpointStat[]> {
        if (!client) return [];
        try {
            let query = `
                SELECT
                    endpoint,
                    count() as count,
                    avg(duration_ms) as avg_duration
                FROM api_usage_logs
                WHERE timestamp >= now() - INTERVAL 7 DAY
            `;

            const params: any = { limit };
            if (accountId) {
                query += ` AND account_id = {accountId:String}`;
                params.accountId = accountId;
            }

            query += `
                GROUP BY endpoint
                ORDER BY count DESC
                LIMIT {limit:UInt32}
            `;

            const result = await client.query({
                query,
                query_params: params,
                format: 'JSONEachRow'
            });
            return await result.json() as EndpointStat[];
        } catch (error) {
            console.error('Failed to get top endpoints:', error);
            return [];
        }
    }
}
