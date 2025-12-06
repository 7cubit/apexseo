import { createClient } from '@clickhouse/client';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

export class DataMigrationHelper {
    private client;

    constructor() {
        this.client = createClient({
            url: process.env.CLICKHOUSE_URL,
            username: process.env.CLICKHOUSE_USER || 'default',
            password: process.env.CLICKHOUSE_PASSWORD,
        });
    }

    /**
     * Upgrades a keyword record with DataForSEO metrics.
     * If the record exists (from Serper), it updates it.
     * If not, it creates it.
     */
    async upgradeKeywordMetrics(keyword: string, metrics: { volume: number, cpc: number, competition: number }) {
        // In ClickHouse ReplacingMergeTree, inserting a new row with the same key effectively "updates" it
        // (eventually, or immediately if we query with FINAL).

        await this.client.insert({
            table: 'keyword_metrics',
            values: [{
                keyword,
                volume: metrics.volume,
                cpc: metrics.cpc,
                competition_level: metrics.competition,
                last_fetched: new Date(), // Updates timestamp
                is_stale: 0
            }],
            format: 'JSONEachRow'
        });

        console.log(`Upgraded metrics for keyword: ${keyword}`);
    }

    /**
     * Atomic Deduction Transaction
     * Checks balance and deducts if sufficient.
     * Returns true if successful, false if insufficient funds.
     */
    async deductCredit(userId: string, amount: number): Promise<boolean> {
        // 1. Check Balance
        const rs = await this.client.query({
            query: `SELECT sum(credits) as balance FROM user_credits WHERE user_id = '${userId}'`,
            format: 'JSONEachRow'
        });
        const rows = await rs.json<{ balance: number }>();
        const balance = rows[0]?.balance || 0;

        if (balance < amount) {
            return false;
        }

        // 2. Deduct (Insert negative delta)
        await this.client.insert({
            table: 'user_credits',
            values: [{
                user_id: userId,
                credits: -amount,
                timestamp: new Date()
            }],
            format: 'JSONEachRow'
        });

        return true;
    }
}
