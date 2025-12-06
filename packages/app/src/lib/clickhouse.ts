import { createClient } from '@clickhouse/client';

const CLICKHOUSE_URL = process.env.CLICKHOUSE_URL || process.env.CLICKHOUSE_HOST;
const CLICKHOUSE_USER = process.env.CLICKHOUSE_USER || 'default';
const CLICKHOUSE_PASSWORD = process.env.CLICKHOUSE_PASSWORD || '';

console.log("Initializing ClickHouse client...", { URL: !!CLICKHOUSE_URL, USER: !!CLICKHOUSE_USER, PASS: !!CLICKHOUSE_PASSWORD });

export const client = (CLICKHOUSE_URL)
    ? createClient({
        url: CLICKHOUSE_URL,
        username: CLICKHOUSE_USER,
        password: CLICKHOUSE_PASSWORD,
        request_timeout: 30000,
    })
    : null;

export async function initClickHouse() {
    if (!client) {
        console.warn("ClickHouse credentials missing. Skipping initialization.");
        return;
    }

    const query = `
    CREATE TABLE IF NOT EXISTS page_embeddings (
      id String,
      embedding Array(Float32)
    ) ENGINE = MergeTree()
    ORDER BY id
  `;

    try {
        await client.query({
            query: query,
            format: 'JSONEachRow',
        });
        console.log("ClickHouse table initialized.");
    } catch (error) {
        console.error("Failed to initialize ClickHouse:", error);
    }
}

export async function insertEmbedding(id: string, embedding: number[]) {
    if (!client) return;

    try {
        await client.insert({
            table: 'page_embeddings',
            values: [
                { id: id, embedding: embedding }
            ],
            format: 'JSONEachRow',
        });
    } catch (error) {
        console.error(`Failed to insert embedding for ${id}:`, error);
    }
}
