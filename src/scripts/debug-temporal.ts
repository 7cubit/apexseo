import { Connection } from '@temporalio/client';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function debug() {
    const address = process.env.TEMPORAL_ADDRESS;
    const apiKey = process.env.TEMPORAL_API_KEY;
    const namespace = process.env.TEMPORAL_NAMESPACE;

    console.log(`Connecting to Temporal at ${address}...`);
    console.log(`Namespace: ${namespace}`);
    console.log(`API Key length: ${apiKey?.length}`);

    try {
        const connection = await Connection.connect({
            address,
            apiKey,
            tls: true,
        });
        console.log("Connection successful!");

        // Try to check health or something
        // @ts-ignore
        const health = await connection.healthService.check({});
        console.log("Health check:", health);

    } catch (error) {
        console.error("Connection failed:", error);
    }
}

debug();
