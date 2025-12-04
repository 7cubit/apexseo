import { createClient } from '@clickhouse/client';
import { driver, DATABASE } from '../../shared/src/lib/neo4j/driver';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

const CLICKHOUSE_MIGRATIONS_TABLE = 'schema_migrations';
const NEO4J_MIGRATIONS_NODE = 'SchemaMigration';

async function getClickHouseClient() {
    return createClient({
        url: process.env.CLICKHOUSE_URL,
        username: process.env.CLICKHOUSE_USER || 'default',
        password: process.env.CLICKHOUSE_PASSWORD,
        request_timeout: 60000,
    });
}

async function initMigrationTracking() {
    const chClient = await getClickHouseClient();
    await chClient.command({
        query: `
            CREATE TABLE IF NOT EXISTS ${CLICKHOUSE_MIGRATIONS_TABLE} (
                version String,
                applied_at DateTime DEFAULT now()
            ) ENGINE = MergeTree()
            ORDER BY version
        `
    });

    if (driver) {
        const session = driver.session({ database: DATABASE });
        try {
            await session.run(`
                CREATE CONSTRAINT migration_version_unique IF NOT EXISTS 
                FOR (m:${NEO4J_MIGRATIONS_NODE}) REQUIRE m.version IS UNIQUE
            `);
        } finally {
            await session.close();
        }
    }
}

async function getAppliedMigrations(): Promise<Set<string>> {
    const applied = new Set<string>();

    // ClickHouse
    const chClient = await getClickHouseClient();
    const chResult = await chClient.query({
        query: `SELECT version FROM ${CLICKHOUSE_MIGRATIONS_TABLE}`,
        format: 'JSONEachRow'
    });
    const chRows = await chResult.json<{ version: string }>();
    // @ts-ignore
    const rows = Array.isArray(chRows) ? chRows : chRows.data || [];
    rows.forEach((row: any) => applied.add(row.version));

    // Neo4j
    // Neo4j
    if (driver) {
        const session = driver.session({ database: DATABASE });
        try {
            const result = await session.run(`MATCH (m:${NEO4J_MIGRATIONS_NODE}) RETURN m.version as version`);
            result.records.forEach(record => {
                const version = record.get('version') as unknown;
                if (typeof version === 'string') {
                    applied.add(version);
                }
            });
        } finally {
            await session.close();
        }
    }

    return applied;
}

async function runMigrations() {
    await initMigrationTracking();
    const applied = await getAppliedMigrations();

    const migrationsDir = path.resolve(__dirname, '../migrations');
    const files = fs.readdirSync(migrationsDir).sort();

    for (const file of files) {
        const version = file.split('_')[0];
        if (applied.has(version)) {
            console.log(`Skipping ${file} (already applied)`);
            continue;
        }

        console.log(`Applying ${file}...`);
        const content = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');

        if (file.endsWith('.sql')) {
            const chClient = await getClickHouseClient();
            const statements = content.split(';').map(s => s.trim()).filter(s => s.length > 0);
            for (const stmt of statements) {
                await chClient.command({ query: stmt });
            }
            await chClient.command({
                query: `INSERT INTO ${CLICKHOUSE_MIGRATIONS_TABLE} (version) VALUES ('${version}')`
            });
        } else if (file.endsWith('.cypher')) {
            if (driver) {
                const session = driver.session({ database: DATABASE });
                try {
                    const queries = content.split(';').map(q => q.trim()).filter(q => q.length > 0 && !q.startsWith('//'));
                    for (const query of queries) {
                        await session.run(query);
                    }
                    await session.run(`CREATE (m:${NEO4J_MIGRATIONS_NODE} {version: $version, applied_at: datetime()})`, { version });
                } finally {
                    await session.close();
                }
            } else {
                console.warn(`Skipping Neo4j migration ${file} because driver is not initialized.`);
            }
        }
        console.log(`✅ Applied ${file}`);
    }

    if (driver) {
        await driver.close();
    }
}

runMigrations().catch(console.error);
