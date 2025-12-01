import { client } from '../../clickhouse';

export interface Claim {
    site_id: string;
    page_id: string;
    claim_id: string;
    claim_text: string;
    risk_score: number;
    verification_status: string;
    source: string;
    embedding?: number[];
}

export class ClickHouseClaimStore {
    static async createTable() {
        if (!client) return;
        await client.command({
            query: `
                CREATE TABLE IF NOT EXISTS claims (
                    site_id String,
                    page_id String,
                    claim_id String,
                    claim_text String,
                    risk_score Float32,
                    verification_status String,
                    source String,
                    embedding Array(Float32),
                    created_at DateTime DEFAULT now()
                ) ENGINE = MergeTree()
                ORDER BY (site_id, page_id)
            `
        });
    }

    static async saveClaim(claim: Claim) {
        if (!client) return;
        await client.insert({
            table: 'claims',
            values: [claim],
            format: 'JSONEachRow',
        });
    }

    static async getClaimsByPage(pageId: string) {
        if (!client) return [];
        const result = await client.query({
            query: `SELECT * FROM claims WHERE page_id = {pageId:String}`,
            query_params: { pageId },
            format: 'JSONEachRow',
        });
        return await result.json();
    }
}
