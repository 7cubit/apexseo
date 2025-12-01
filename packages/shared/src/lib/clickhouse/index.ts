import { client } from './client';
import { ClickHouseAlertRepository } from './repositories/ClickHouseAlertRepository';

export * from './client';

export async function initClickHouse() {
    if (!client) {
        console.warn("ClickHouse credentials missing. Skipping initialization.");
        return;
    }

    const query = `
    CREATE TABLE IF NOT EXISTS page_embeddings(
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

        await ClickHouseAlertRepository.createTable();
        console.log("ClickHouse alerts table initialized.");
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
        console.error(`Failed to insert embedding for ${id}: `, error);
    }
}

export * from './repositories/ClickHouseAlertRepository';
