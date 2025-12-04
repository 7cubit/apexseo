import { createClient } from '@clickhouse/client';
import neo4j from 'neo4j-driver';
import { Connection, Client } from '@temporalio/client';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load .env.local manually to be sure
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    console.error("ERROR: .env.local file not found!");
    process.exit(1);
}

async function testClickHouse() {
    console.log("\n--- Testing ClickHouse Cloud ---");
    const url = process.env.CLICKHOUSE_URL;
    const password = process.env.CLICKHOUSE_PASSWORD;

    if (!url) {
        console.error("SKIPPING: CLICKHOUSE_URL missing.");
        return;
    }

    console.log(`URL: ${url}`);

    const client = createClient({
        url,
        username: 'default',
        password,
        request_timeout: 10000,
    });

    try {
        const result = await client.query({
            query: 'SELECT 1',
            format: 'JSONEachRow',
        });
        console.log("SUCCESS: Connected to ClickHouse Cloud!");
    } catch (error: any) {
        console.error("FAILURE: ClickHouse connection failed.");
        console.error(error.message);
    }
}

async function testNeo4j() {
    console.log("\n--- Testing Neo4j AuraDB ---");
    const uri = process.env.NEO4J_URI;
    const user = process.env.NEO4J_USER;
    const password = process.env.NEO4J_PASSWORD;

    if (!uri || !user || !password) {
        console.error("SKIPPING: NEO4J_URI, NEO4J_USER, or NEO4J_PASSWORD missing.");
        return;
    }

    console.log(`URI: ${uri}`);

    const driver = neo4j.driver(uri, neo4j.auth.basic(user, password), { disableLosslessIntegers: true });
    try {
        await driver.verifyConnectivity();
        console.log("SUCCESS: Connected to Neo4j AuraDB!");
    } catch (error: any) {
        console.error("FAILURE: Neo4j connection failed.");
        console.error(error.message);
    } finally {
        await driver.close();
    }
}

async function testTemporal() {
    console.log("\n--- Testing Temporal Cloud ---");
    const address = process.env.TEMPORAL_ADDRESS;
    const apiKey = process.env.TEMPORAL_API_KEY;
    const namespace = process.env.TEMPORAL_NAMESPACE || 'default';

    if (!address) {
        console.error("SKIPPING: TEMPORAL_ADDRESS missing.");
        return;
    }

    console.log(`Address: ${address}`);
    console.log(`Namespace: ${namespace}`);
    console.log(`Auth Method: ${apiKey ? 'API Key' : 'mTLS (Cert/Key)'}`);

    if (!apiKey) {
        console.log("Note: No TEMPORAL_API_KEY found. Assuming mTLS is required but not configured in this script (as per user request to check for certs).");
        // If the user expects mTLS, we should check for certs here, but the app code uses API Key.
        // Let's try to connect without creds (will likely fail if auth required) or just report.
    }

    try {
        const connection = await Connection.connect({
            address,
            apiKey,
            tls: !!apiKey, // Only use TLS if API Key is present (Cloud), otherwise assume plaintext (Self-hosted)
        });

        const client = new Client({
            connection,
            namespace,
        });

        // Try to list workflows or just check health
        await client.workflowService.getSystemInfo({});
        console.log("SUCCESS: Connected to Temporal Cloud!");
    } catch (error: any) {
        console.error("FAILURE: Temporal connection failed.");
        console.error(error);
        if (error.cause) console.error("Cause:", error.cause);
        if (error.details) console.error("Details:", error.details);
    }
}

async function main() {
    await testClickHouse();
    await testNeo4j();
    await testTemporal();
}

main().catch(console.error);
