// import { Connection, Client } from '@temporalio/client';

export async function createTemporalClient() {
    const address = process.env.TEMPORAL_ADDRESS;
    const namespace = process.env.TEMPORAL_NAMESPACE || 'default';
    const apiKey = process.env.TEMPORAL_API_KEY;

    if (!address) {
        console.warn("TEMPORAL_ADDRESS is missing. Temporal integration disabled.");
        return null;
    }

    // const connection = await Connection.connect({
    //     address,
    //     apiKey, // Pass API key directly if using Temporal Cloud with API Key auth
    //     tls: !!apiKey, // Enable TLS if API Key is present (Cloud), otherwise assume plaintext/local unless configured
    // });

    // return client;
    console.warn("Temporal disabled to prevent segfault.");
    return null as any;
}
