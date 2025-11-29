import { client } from '../../clickhouse';

export interface Claim {
    claim_id: string;
    site_id: string;
    page_id: string;
    text: string;
    embedding?: number[];
    risk_score: number;
    verification_status: 'unverified' | 'verified' | 'debunked';
    created_at?: string;
}

export interface KBEntry {
    id: string;
    title: string;
    text: string;
    embedding: number[];
    source: string;
    created_at?: string;
}

export class ClickHouseClaimStore {
    static async initialize() {
        if (!client) return;
        await client.command({
            query: `
                CREATE TABLE IF NOT EXISTS claims (
                    claim_id String,
                    site_id String,
                    page_id String,
                    text String,
                    embedding Array(Float32),
                    risk_score Float32,
                    verification_status String,
                    created_at DateTime DEFAULT now()
                ) ENGINE = MergeTree()
                ORDER BY (site_id, claim_id)
            `
        });

        await client.command({
            query: `
                CREATE TABLE IF NOT EXISTS kb_entries (
                    id String,
                    title String,
                    text String,
                    embedding Array(Float32),
                    source String,
                    created_at DateTime DEFAULT now()
                ) ENGINE = MergeTree()
                ORDER BY id
            `
        });
    }

    static async saveClaim(claim: Claim) {
        if (!client) return;
        await client.insert({
            table: 'claims',
            values: [claim],
            format: 'JSONEachRow'
        });
    }

    static async saveKBEntry(entry: KBEntry) {
        if (!client) return;
        await client.insert({
            table: 'kb_entries',
            values: [entry],
            format: 'JSONEachRow'
        });
    }

    static async findSimilarKBEntries(embedding: number[], limit: number = 3): Promise<KBEntry[]> {
        if (!client) return [];
        const query = `
            SELECT 
                id, title, text, source,
                L2Distance(embedding, {embedding:Array(Float32)}) as dist
            FROM kb_entries
            ORDER BY dist ASC
            LIMIT {limit:Int32}
        `;
        const resultSet = await client.query({
            query,
            query_params: { embedding, limit },
            format: 'JSONEachRow'
        });
        return await resultSet.json() as unknown as KBEntry[];
    }

    static async getClaimsBySite(siteId: string, limit: number = 50): Promise<Claim[]> {
        if (!client) return [];
        const resultSet = await client.query({
            query: `
                SELECT * FROM claims 
                WHERE site_id = {siteId: String}
                ORDER BY risk_score DESC
                LIMIT {limit: Int32}
            `,
            query_params: { siteId, limit }
        });
        const rows = await resultSet.json();
        return rows as unknown as Claim[];
    }

    static async getHighRiskPages(siteId: string, limit: number = 20): Promise<any[]> {
        if (!client) return [];
        // Aggregate risk by page
        const resultSet = await client.query({
            query: `
                SELECT page_id, count() as claim_count, avg(risk_score) as avg_risk, max(risk_score) as max_risk
                FROM claims
                WHERE site_id = {siteId: String}
                GROUP BY page_id
                ORDER BY max_risk DESC
                LIMIT {limit: Int32}
            `,
            query_params: { siteId, limit }
        });
        return await resultSet.json() as unknown as any[];
    }
}
