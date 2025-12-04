import { client } from '../../shared/src/lib/clickhouse/client';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

async function initClickHouseSchema() {
    console.log('🚀 Initializing ClickHouse Schema...');

    if (!client) {
        console.error('❌ ClickHouse client not initialized');
        process.exit(1);
    }

    const schemaPath = path.join(__dirname, '../clickhouse/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
    const queries = schemaSql.split(';').filter(q => q.trim().length > 0);

    try {
        for (const query of queries) {
            console.log(`Executing: ${query.substring(0, 50)}...`);
            await client.command({ query });
        }
        console.log('✅ ClickHouse Schema applied successfully.');
    } catch (error) {
        console.error('❌ Failed to apply ClickHouse schema:', error);
    } finally {
        await client.close();
    }
}

initClickHouseSchema();
