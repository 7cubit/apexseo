import { client } from './client';
import { ClickHouseAlertRepository } from './repositories/ClickHouseAlertRepository';
import { ClickHousePageRepository } from './repositories/ClickHousePageRepository';
import { ClickHouseProjectUserRepository } from './repositories/ClickHouseProjectUserRepository';
import { ClickHouseScoreRepository } from './repositories/ClickHouseScoreRepository';

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
        console.log("Initializing page_embeddings...");
        await client.query({
            query: query,
            format: 'JSONEachRow',
        });
        console.log("ClickHouse table initialized.");

        console.log("Initializing alerts table...", !!ClickHouseAlertRepository);
        await ClickHouseAlertRepository.createTable();
        console.log("ClickHouse alerts table initialized.");

        console.log("Initializing pages table...", !!ClickHousePageRepository);
        await ClickHousePageRepository.createTable();
        console.log("ClickHouse pages table initialized.");

        console.log("Initializing project_users table...", !!ClickHouseProjectUserRepository);
        await ClickHouseProjectUserRepository.createTable();
        console.log("ClickHouse project_users table initialized.");

        console.log("Initializing score_history table...", !!ClickHouseScoreRepository);
        await ClickHouseScoreRepository.createTable();
        console.log("ClickHouse score_history table initialized.");
    } catch (error) {
        console.error("Failed to initialize ClickHouse:", JSON.stringify(error, null, 2));
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
export * from './repositories/ClickHousePageRepository';
export * from './repositories/ClickHouseProjectUserRepository';
export * from './repositories/ClickHouseScoreRepository';
