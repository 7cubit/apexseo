import { Worker, NativeConnection } from '@temporalio/worker';
import * as activities from './activities';
import * as dataForSeoActivities from './activities/dataforseo';
import dotenv from 'dotenv';
import { logger } from '@apexseo/shared';

dotenv.config();

// initTelemetry('temporal-worker');

async function run() {
    logger.info('Starting Temporal worker...');

    const connection = await NativeConnection.connect({
        address: process.env.TEMPORAL_ADDRESS || 'localhost:7233',
    });

    const worker = await Worker.create({
        connection,
        workflowsPath: require.resolve('./workflows'),
        activities: { ...activities, ...dataForSeoActivities },
        taskQueue: 'seo-tasks-queue',
        maxConcurrentActivityTaskExecutions: 100,
        maxConcurrentWorkflowTaskExecutions: 50,
        // Add interceptors for logging/circuit breaking if needed
    });

    await worker.run();
}

run().catch((err) => {
    console.error('RAW WORKER ERROR:', err);
    if (err.cause) console.error('CAUSE:', err.cause);
    logger.error('Worker failed to start', { error: err });
    process.exit(1);
});
