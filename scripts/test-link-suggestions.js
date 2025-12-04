const dotenv = require('dotenv');
dotenv.config();

const { createClient } = require('@clickhouse/client');
const neo4j = require('neo4j-driver');
const jwt = require('jsonwebtoken');

const API_URL = 'http://localhost:4000';
const SECRET = process.env.NEXTAUTH_SECRET || 'supersecret';
const PROJECT_ID = '9aa884ea-b534-4dc1-a6fc-cb13be7fae5c'; // Use existing project
const DOMAIN = 'example.com';

async function setupNeo4jData() {
    console.log('🛠️  Setting up Neo4j Mock Data...');
    const driver = neo4j.driver(
        process.env.NEO4J_URI,
        neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
    );
    const session = driver.session();

    try {
        await session.run(`
            MERGE (p:Project {id: $projectId})
            MERGE (c:Cluster {name: 'Mock Cluster'})
            
            MERGE (p1:Page {page_id: 'source-page', url: '/source-page', title: 'High Authority Source'})
            MERGE (p2:Page {page_id: 'target-page', url: '/target-page', title: 'Low Authority Target'})
            
            MERGE (p1)-[:BELONGS_TO_CLUSTER]->(c)
            MERGE (p2)-[:BELONGS_TO_CLUSTER]->(c)
            MERGE (p1)-[:BELONGS_TO]->(p)
            MERGE (p2)-[:BELONGS_TO]->(p)
            
            WITH p1, p2
            // Ensure NO link exists between p1 and p2
            OPTIONAL MATCH (p1)-[r:LINKS_TO]->(p2) DELETE r
        `, { projectId: PROJECT_ID });
        console.log('✅ Neo4j data setup complete');
    } catch (e) {
        console.error('❌ Neo4j setup failed:', e);
    } finally {
        await session.close();
        await driver.close();
    }
}

async function runTest() {
    await setupNeo4jData();

    console.log('\n🧪 Testing Link Suggestion Workflow...');

    // 1. Generate JWT
    const token = jwt.sign({ id: 'test-user', email: 'test@example.com' }, SECRET);

    // 2. Trigger Workflow
    console.log('🚀 Triggering Workflow via API...');
    const res = await fetch(`${API_URL}/projects/${PROJECT_ID}/internal-links/generate`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!res.ok) {
        console.error('❌ Failed to trigger workflow:', await res.text());
        process.exit(1);
    }

    const data = await res.json();
    console.log('✅ Workflow triggered:', data);

    // 3. Wait for Workflow (It's async, so we wait a bit)
    console.log('⏳ Waiting for workflow to complete (20s)...');
    await new Promise(resolve => setTimeout(resolve, 20000));

    // 4. Verify Results via API
    console.log('🔍 Verifying Suggestions via API...');
    const getRes = await fetch(`${API_URL}/projects/${PROJECT_ID}/internal-links`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!getRes.ok) {
        console.error('❌ Failed to fetch suggestions:', await getRes.text());
    } else {
        const suggestions = await getRes.json();
        console.log(`✅ API returned ${suggestions.length} suggestions`);
    }

    // 5. Verify ClickHouse Directly
    console.log('🔍 Verifying ClickHouse Data Directly...');
    const client = createClient({
        url: process.env.CLICKHOUSE_HOST,
        username: process.env.CLICKHOUSE_USER,
        password: process.env.CLICKHOUSE_PASSWORD,
        database: process.env.CLICKHOUSE_DB
    });

    const chResult = await client.query({
        query: `SELECT * FROM internal_link_recommendations WHERE source_page_id IN ('source-page', 'target-page')`,
        format: 'JSONEachRow'
    });
    const chRows = await chResult.json();
    console.log(`✅ ClickHouse has ${chRows.length} rows for these pages`);
    if (chRows.length > 0) {
        console.log('   Sample:', chRows[0]);
    }
    await client.close();
}

runTest().catch(console.error);
