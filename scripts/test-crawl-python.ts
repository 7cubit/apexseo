import * as dotenv from 'dotenv';
import path from 'path';
// Load env vars immediately
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { Client, Connection } from '@temporalio/client';
import { ClickHousePageRepository } from '../packages/shared/src/lib/clickhouse/repositories/ClickHousePageRepository';
import { client as clickhouseClient, initClickHouse } from '../packages/shared/src/lib/clickhouse';

async function runTest() {
    console.log('Starting End-to-End Pipeline Test...');
    await initClickHouse();

    const temporalHost = process.env.TEMPORAL_ADDRESS || 'localhost:7233';
    console.log(`Connecting to Temporal at ${temporalHost}`);

    const connection = await Connection.connect({ address: temporalHost });
    const client = new Client({ connection });

    const siteId = 'example.com';
    const startUrl = 'https://example.com';
    const workflowId = `test-crawl-python-${Date.now()}`;

    try {
        console.log(`Starting workflow ${workflowId} for ${startUrl}`);
        const handle = await client.workflow.start('SiteCrawlWorkflow', {
            taskQueue: 'seo-tasks-queue', // Ensure this matches the worker's queue (Node worker)
            workflowId: workflowId,
            args: [{
                siteId,
                startUrl,
                maxDepth: 1,
                limit: 5
            }],
        });

        console.log(`Workflow started. Waiting for completion...`);
        await handle.result();
        console.log(`Workflow completed!`);

        // Verify ClickHouse Data
        console.log('Verifying ClickHouse Data...');
        // Wait a bit for async inserts if any (though workflow waits for activity)
        await new Promise(r => setTimeout(r, 2000));

        if (!clickhouseClient) {
            console.error("ClickHouse client not initialized");
            return;
        }

        const result = await clickhouseClient.query({
            query: `SELECT count() as count FROM pages WHERE site_id = {siteId:String}`,
            query_params: { siteId },
            format: 'JSONEachRow'
        });
        const rows = await result.json() as any[];
        const count = rows[0].count;

        console.log(`Found ${count} pages in ClickHouse for ${siteId}`);



        if (count > 0) {
            console.log('✅ Test PASSED: Pages were crawled and persisted.');
        } else {
            console.error('❌ Test FAILED: No pages found in ClickHouse.');
        }

    } catch (error) {
        console.error('Test failed:', error);
    }
}

runTest();
