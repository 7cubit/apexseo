import { Connection, Client } from '@temporalio/client';

export async function createTemporalClient() {
    const address = process.env.TEMPORAL_ADDRESS;
    const namespace = process.env.TEMPORAL_NAMESPACE || 'default';
    const apiKey = process.env.TEMPORAL_API_KEY;

    if (!address) {
        console.warn("TEMPORAL_ADDRESS is missing. Temporal integration disabled.");
        return null;
    }

    const connection = await Connection.connect({
        address,
        apiKey, // Pass API key directly if using Temporal Cloud with API Key auth
        tls: true, // Required for Temporal Cloud
    });

    const client = new Client({
        connection,
        namespace,
    });

    return client;
}
