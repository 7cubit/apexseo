
import { Connection, Client } from '@temporalio/client';
import { ClickHouseScoreRepository, initClickHouse } from '../packages/shared/src/lib/clickhouse';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function runTest() {
    console.log('Starting Scoring Workflow Test...');
    await initClickHouse();

    const projectId = 'test-project-scoring';

    // Seed a page
    const { client: chClient } = await import('../packages/shared/src/lib/clickhouse/client');
    if (chClient) {
        await chClient.insert({
            table: 'pages',
            values: [{
                site_id: projectId,
                url: 'https://example.com/scoring-test',
                status: '200',
                title: 'Scoring Test Page',
                content: 'This is a test page with enough content to calculate a depth score. It needs to be long enough to trigger some score.',
                crawled_at: new Date().toISOString().replace('T', ' ').split('.')[0]
            }],
            format: 'JSONEachRow'
        });
        console.log('Seeded test page.');
    }

    // Connect to Temporal
    const connection = await Connection.connect({ address: process.env.TEMPORAL_ADDRESS || 'localhost:7233' });
    const client = new Client({ connection });

    try {
        console.log('1. Starting Scoring Workflow...');
        const handle = await client.workflow.start('ScoringWorkflow', {
            args: [projectId],
            taskQueue: 'seo-tasks-queue',
            workflowId: `scoring-${projectId}-${Date.now()}`
        });
        console.log(`Workflow started: ${handle.workflowId}`);

        console.log('2. Waiting for Workflow completion...');
        await handle.result();
        console.log('✅ Workflow completed.');

        console.log('3. Verifying Scores in ClickHouse...');
        // Wait a bit for async insert if any
        await new Promise(r => setTimeout(r, 2000));

        const scores = await ClickHouseScoreRepository.getLatestScores(projectId);
        console.log(`Found ${scores.length} score records.`);

        if (scores.length > 0) {
            console.log('Sample Score:', scores[0]);
            console.log('✅ Test PASSED: Scores persisted.');
        } else {
            console.warn('⚠️ No scores found. Did the project have pages?');
            // If we didn't seed pages, this is expected.
            // We should probably seed a page first.
        }

    } catch (error) {
        console.error('❌ Test FAILED:', error);
    }
}

runTest();
