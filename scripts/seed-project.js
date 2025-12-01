#!/usr/bin/env node

const CLICKHOUSE_URL = 'http://localhost:8123';

async function seedProject() {
    console.log('Creating test project in ClickHouse...');

    // Create projects table
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS projects (
            id String,
            name String,
            domain String,
            user_id String,
            created_at DateTime,
            site_doctor_enabled UInt8 DEFAULT 1,
            site_doctor_cron String DEFAULT '0 2 * * *',
            rank_tracker_enabled UInt8 DEFAULT 1,
            rank_tracker_cron String DEFAULT '0 */6 * * *'
        ) ENGINE = MergeTree()
        ORDER BY (user_id, created_at)
    `;

    try {
        const headers = {
            'X-ClickHouse-User': 'default',
            'X-ClickHouse-Key': 'default'
        };

        // Create table
        const createResponse = await fetch(CLICKHOUSE_URL, {
            method: 'POST',
            headers,
            body: createTableQuery
        });

        if (!createResponse.ok) {
            throw new Error(`Failed to create table: ${await createResponse.text()}`);
        }
        console.log('✅ Projects table created');

        // Insert project
        const insertQuery = `
            INSERT INTO projects (id, name, domain, user_id, created_at) 
            VALUES ('test-project-1', 'Example SEO Site', 'example.com', 'user-1', now())
        `;

        const insertResponse = await fetch(CLICKHOUSE_URL, {
            method: 'POST',
            headers,
            body: insertQuery
        });

        if (!insertResponse.ok) {
            throw new Error(`Failed to insert project: ${await insertResponse.text()}`);
        }
        console.log('✅ Project created: Example SEO Site');

        // Verify
        const selectResponse = await fetch(CLICKHOUSE_URL + '?query=SELECT%20*%20FROM%20projects%20FORMAT%20JSON', {
            headers
        });
        const result = await selectResponse.json();
        console.log(`✅ Total projects: ${result.rows}`);
        console.log('\nProject details:', result.data[0]);

        console.log('\n🎉 Seed completed successfully!');
        console.log('\nNext steps:');
        console.log('1. Run: npx ts-node-dev -r dotenv/config --project packages/workers/tsconfig.json packages/workers/src/scripts/sync-schedules.ts');
        console.log('2. Start worker: cd packages/workers && npm run dev');
        console.log('3. Check Temporal UI: http://localhost:8080');

    } catch (error) {
        console.error('❌ Error seeding project:', error);
        process.exit(1);
    }
}

seedProject();
