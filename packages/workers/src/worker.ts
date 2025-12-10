import { Worker, NativeConnection } from '@temporalio/worker';
import * as activities from './activities';
import * as dataForSeoActivities from './activities/dataforseo';
import dotenv from 'dotenv';
import { logger } from '@apexseo/shared';
import { Worker as BullWorker } from 'bullmq';
import IORedis from 'ioredis';

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

    // Initialize BullMQ Worker
    const redisConnection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');

    const htmlWorker = new BullWorker('html-processing', async job => {
        logger.info(`Processing HTML job ${job.id} for URL: ${job.data.url}`);
        // Mock DB Save
        console.log('Saving to DB...');
        // Simulate processing
        await new Promise(resolve => setTimeout(resolve, 100));
        return { success: true };
    }, { connection: redisConnection });

    htmlWorker.on('completed', job => {
        logger.info(`BullMQ Job ${job.id} completed`);
    });

    htmlWorker.on('failed', (job, err) => {
        logger.error(`BullMQ Job ${job?.id} failed: ${err.message}`);
    });

    logger.info('BullMQ Worker started for html-processing');

    await worker.run();
}

run().catch((err) => {
    console.error('RAW WORKER ERROR:', err);
    if (err.cause) console.error('CAUSE:', err.cause);
    logger.error('Worker failed to start', { error: err });
    process.exit(1);
});
