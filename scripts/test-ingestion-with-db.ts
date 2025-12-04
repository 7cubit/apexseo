console.log('🚀 Script started');

const dotenv = require('dotenv');
dotenv.config();

let Connection, WorkflowClient, driver, DATABASE, clickhouse, jwt;

try {
    ({ Connection, WorkflowClient } = require('@temporalio/client'));
    jwt = require('jsonwebtoken');

    // Inline Neo4j Driver
    const neo4j = require('neo4j-driver');
    const NEO4J_URI = process.env.NEO4J_URI;
    const NEO4J_USER = process.env.NEO4J_USER;
    const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD;
    DATABASE = process.env.NEO4J_DATABASE || 'neo4j';

    if (NEO4J_URI && NEO4J_USER && NEO4J_PASSWORD) {
        driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD));
        console.log('✅ Neo4j driver initialized (inline)');
    } else {
        console.warn('⚠️ Missing Neo4j env vars');
    }

    // Inline ClickHouse Client
    const { createClient } = require('@clickhouse/client');
    const CLICKHOUSE_URL = process.env.CLICKHOUSE_URL;
    const CLICKHOUSE_USER = process.env.CLICKHOUSE_USER || 'default';
    const CLICKHOUSE_PASSWORD = process.env.CLICKHOUSE_PASSWORD;

    if (CLICKHOUSE_URL && CLICKHOUSE_PASSWORD) {
        clickhouse = createClient({
            url: CLICKHOUSE_URL,
            username: CLICKHOUSE_USER,
            password: CLICKHOUSE_PASSWORD,
            request_timeout: 30000,
        });
        console.log('✅ ClickHouse client initialized (inline)');
    } else {
        console.warn('⚠️ Missing ClickHouse env vars');
    }

    console.log('✅ Imports successful');
} catch (e) {
    console.error('❌ Import failed:', e);
    process.exit(1);
}

const API_URL = 'http://localhost:4000';
const SECRET = process.env.NEXTAUTH_SECRET || 'supersecret';

async function runTest() {
    console.log('🧪 Starting End-to-End Ingestion Test with DB Verification...');

    // 1. Generate JWT
    const token = jwt.sign({
        id: 'user-unity-test',
        email: 'unity@test.com',
        name: 'Unity Tester'
    }, SECRET);

    // 2. Create Project via API
    const projectName = `UnityDB_Test_${Date.now()}`;
    const domain = 'example.com';

    console.log(`\n🏗️  Creating Project: "${projectName}"...`);
    const res = await fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            name: projectName,
            domain: domain,
            description: 'UnityDB Test Project',
            types: ['audit']
        })
    });

    if (!res.ok) {
        console.error('❌ Failed to create project:', await res.text());
        process.exit(1);
    }

    const data = await res.json();
    // @ts-ignore
    if (!data.project || !data.project.id) {
        console.error('❌ Invalid response format:', data);
        process.exit(1);
    }
    // @ts-ignore
    const projectId = data.project.id;
    console.log(`   ✅ Project Created: ${projectId}`);

    // 3. Monitor Temporal Workflow
    console.log('\n⏳ Verifying Temporal Workflow Execution...');
    const connection = await Connection.connect({ address: 'localhost:7233' });
    const client = new WorkflowClient({ connection, namespace: 'default' });

    const workflowId = `ingest-${projectId}`;
    const handle = client.getHandle(workflowId);

    try {
        await handle.describe();
        console.log(`   ✅ Workflow Status: RUNNING`);
    } catch (e) {
        console.error('❌ Workflow not found!');
        process.exit(1);
    }

    // Wait for workflow to complete (or at least crawl to finish)
    console.log('   Waiting for workflow to process pages (30s)...');
    await new Promise(resolve => setTimeout(resolve, 30000));

    // 4. Verify Neo4j Data
    console.log('\n🔍 Verifying Neo4j Data...');
    if (!driver) {
        console.error('❌ Neo4j driver not initialized');
        process.exit(1);
    }
    const session = driver.session({ database: DATABASE });
    try {
        const pageResult = await session.run(
            `
            MATCH (pg:Page)-[:BELONGS_TO]->(p:Project {id: $projectId})
            RETURN count(pg) as pageCount, collect(pg.url) as urls
            `,
            { projectId }
        );

        const pageCount = pageResult.records[0].get('pageCount').toNumber();
        console.log(`   Neo4j Page Count: ${pageCount}`);
        if (pageCount > 0) {
            console.log(`   ✅ Neo4j has pages: ${pageResult.records[0].get('urls').slice(0, 3)}...`);
        } else {
            console.warn(`   ⚠️ Neo4j has no pages yet.`);
        }

    } finally {
        await session.close();
    }

    // 5. Verify ClickHouse Data
    console.log('\n🔍 Verifying ClickHouse Data...');
    if (!clickhouse) {
        console.error('❌ ClickHouse client not initialized');
        process.exit(1);
    }

    try {
        const result = await clickhouse.query({
            query: `SELECT count() as count, groupArray(url) as urls FROM pages WHERE site_id = {domain:String}`,
            query_params: { domain },
            format: 'JSONEachRow'
        });
        const rows = await result.json();
        const count = rows[0].count;
        console.log(`   ClickHouse Page Count: ${count}`);

        if (count > 0) {
            console.log(`   ✅ ClickHouse has pages: ${rows[0].urls.slice(0, 3)}...`);
        } else {
            console.warn(`   ⚠️ ClickHouse has no pages yet.`);
        }

    } catch (e) {
        console.error('❌ ClickHouse query failed:', e);
    }

    console.log('\n🏁 Test Complete.');
    process.exit(0);
}

runTest().catch(e => {
    console.error('❌ Test failed:', e);
    process.exit(1);
});
