import { Worker } from '@temporalio/worker';
import * as activities from './activities';
import { join } from 'path';

async function run() {
    // Step 1: Register Workflows and Activities with the Worker
    const worker = await Worker.create({
        workflowsPath: join(__dirname, 'workflow.ts'), // Path to workflow definitions
        activities, // Activity implementations
        taskQueue: 'gap-fill-queue',
    });

    // Step 2: Start accepting tasks
    await worker.run();
}

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
