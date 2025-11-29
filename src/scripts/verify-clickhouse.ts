import { createClient } from '@clickhouse/client';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

void (async () => {
    const url = process.env.CLICKHOUSE_URL;
    const username = process.env.CLICKHOUSE_USER || 'default';
    const password = process.env.CLICKHOUSE_PASSWORD;

    if (!url || !password) {
        console.error("Missing ClickHouse environment variables.");
        process.exit(1);
    }

    const client = createClient({
        url,
        username,
        password,
    });

    try {
        const rows = await client.query({
            query: 'SELECT 1',
            format: 'JSONEachRow',
        });
        console.log('Result: ', await rows.json());
    } catch (error) {
        console.error("ClickHouse verification failed:", error);
    } finally {
        await client.close();
    }
})();
