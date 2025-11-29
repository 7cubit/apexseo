import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars BEFORE other imports
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { Worker, NativeConnection } from '@temporalio/worker';
import 'tsconfig-paths/register';
// Activities will be required after env vars are loaded

async function run() {
    const address = process.env.TEMPORAL_ADDRESS;
    const namespace = process.env.TEMPORAL_NAMESPACE || 'default';
    const apiKey = process.env.TEMPORAL_API_KEY;

    if (!address) {
        console.error("TEMPORAL_ADDRESS is missing.");
        return;
    }

    const connection = await NativeConnection.connect({
        address,
        apiKey,
        tls: true, // Required for Temporal Cloud
    });

    // Require activities here to ensure env vars are loaded first
    const activities = require('./activities');

    // Create workers for each task queue
    const queues = [
        'seo-orchestrator',
        'seo-heavy-jobs',
        'seo-ux-sim'
    ];

    const workers = await Promise.all(queues.map(async (queue) => {
        const worker = await Worker.create({
            workflowsPath: require.resolve('./workflows'),
            activities,
            taskQueue: queue,
            connection,
            namespace,
        });
        return worker;
    }));

    console.log(`Starting workers for queues: ${queues.join(', ')}`);
    await Promise.all(workers.map(w => w.run()));
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
