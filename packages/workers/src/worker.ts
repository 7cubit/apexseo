import { Worker } from '@temporalio/worker';
import * as activities from './activities';
import dotenv from 'dotenv';
import { logger, initTelemetry } from '@apexseo/shared';

dotenv.config();

initTelemetry('temporal-worker');

async function run() {
    logger.info('Starting Temporal worker...');
    const worker = await Worker.create({
        workflowsPath: require.resolve('./workflows'),
        activities,
        taskQueue: 'seo-tasks-queue',
        maxConcurrentActivityTaskExecutions: 100,
        maxConcurrentWorkflowTaskExecutions: 50,
        // Add interceptors for logging/circuit breaking if needed
    });

    await worker.run();
}

run().catch((err) => {
    logger.error('Worker failed to start', { error: err });
    process.exit(1);
});
