import { createClient } from '@clickhouse/client';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

async function markStaleData() {
    const client = createClient({
        url: process.env.CLICKHOUSE_URL,
        username: process.env.CLICKHOUSE_USER || 'default',
        password: process.env.CLICKHOUSE_PASSWORD,
        request_timeout: 60000,
    });

    console.log('Marking stale data...');

    // 1. SERPs: Stale after 7 days
    await client.command({
        query: `ALTER TABLE cached_serps UPDATE is_stale = 1 WHERE last_updated < now() - INTERVAL 7 DAY`
    });
    console.log('Marked stale SERPs.');

    // 2. Metrics: Stale after 30 days
    await client.command({
        query: `ALTER TABLE keyword_metrics UPDATE is_stale = 1 WHERE last_fetched < now() - INTERVAL 30 DAY`
    });
    console.log('Marked stale Metrics.');

    // 3. Competitors: Stale after 14 days
    await client.command({
        query: `ALTER TABLE competitor_domains UPDATE is_stale = 1 WHERE last_updated < now() - INTERVAL 14 DAY`
    });
    console.log('Marked stale Competitors.');

    await client.close();
}

markStaleData().catch(console.error);
