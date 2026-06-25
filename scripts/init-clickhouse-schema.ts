import { createClient } from '@clickhouse/client';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
}

async function main() {
    console.log("Initializing ClickHouse Schema...");

    let url = process.env.CLICKHOUSE_URL;
    const password = process.env.CLICKHOUSE_PASSWORD;

    if (!url) {
        console.error("CLICKHOUSE_URL is missing.");
        process.exit(1);
    }

    if (!url.startsWith('http')) {
        url = `https://${url}`;
    }

    const client = createClient({
        url,
        username: 'default',
        password,
        request_timeout: 90000,
    });

    const schemaPath = path.resolve(process.cwd(), 'packages/database/clickhouse/schema.sql');
    if (!fs.existsSync(schemaPath)) {
        console.error(`Schema file not found at ${schemaPath}`);
        process.exit(1);
    }

    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

    // Split by semicolon to execute multiple statements
    // This is a simple split and might break on semicolons in strings, but sufficient for this schema
    const statements = schemaSql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

    console.log(`Found ${statements.length} statements to execute.`);

    for (const statement of statements) {
        try {
            // Extract table name for logging if possible
            const match = statement.match(/CREATE TABLE IF NOT EXISTS (\w+)/i);
            const tableName = match ? match[1] : 'unknown';

            console.log(`Executing: ${statement.substring(0, 50)}...`);
            await client.command({
                query: statement,
            });
            console.log(`✅ Success: ${tableName}`);
        } catch (error: any) {
            console.error(`❌ Failed to execute statement: ${statement.substring(0, 50)}...`);
            console.error(error.message);
            // Don't exit, try next statement
        }
    }

    console.log("Schema initialization complete.");
}

main().catch(console.error);
