const { createClient } = require('@clickhouse/client');
const dotenv = require('dotenv');
dotenv.config();

const client = createClient({
    url: process.env.CLICKHOUSE_URL,
    username: process.env.CLICKHOUSE_USER || 'default',
    password: process.env.CLICKHOUSE_PASSWORD,
});

async function insertMockData() {
    const domain = 'example.com'; // This matches the domain used in the ingestion test
    const pageId = 'mock-page-id-1';

    console.log(`Inserting mock data for domain: ${domain}`);

    try {
        await client.insert({
            table: 'pages',
            values: [{
                site_id: domain,
                page_id: pageId,
                url: '/mock-page',
                title: 'Mock Page for Dashboard Verification',
                content: 'This is a mock page content.',
                word_count: 500,
                status: '200',
                crawled_at: new Date().toISOString().replace('T', ' ').split('.')[0],
                content_score: 85,
                is_orphan: 0,
                link_count_internal: 5,
                link_count_external: 2,
                keywords: ['mock', 'test', 'dashboard']
            }],
            format: 'JSONEachRow',
        });
        console.log('✅ Mock page inserted successfully');
    } catch (e) {
        console.error('❌ Failed to insert mock page:', e);
    }
}

insertMockData();
