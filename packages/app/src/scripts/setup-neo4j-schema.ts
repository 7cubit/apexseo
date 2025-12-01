import neo4j from 'neo4j-driver';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const URI = process.env.NEO4J_URI;
const USER = process.env.NEO4J_USER;
const PASSWORD = process.env.NEO4J_PASSWORD;
const DATABASE = process.env.NEO4J_DATABASE || 'neo4j';

if (!URI || !USER || !PASSWORD) {
    console.error("Missing Neo4j environment variables.");
    process.exit(1);
}

const driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));

async function setupSchema() {
    const session = driver.session({ database: DATABASE });
    try {
        console.log("Setting up Neo4j Schema...");

        // Constraints
        const constraints = [
            'CREATE CONSTRAINT IF NOT EXISTS FOR (s:Site) REQUIRE s.id IS UNIQUE',
            'CREATE CONSTRAINT IF NOT EXISTS FOR (p:Page) REQUIRE p.page_id IS UNIQUE',
            'CREATE CONSTRAINT IF NOT EXISTS FOR (p:Page) REQUIRE p.url IS UNIQUE',
            'CREATE CONSTRAINT IF NOT EXISTS FOR (c:Cluster) REQUIRE c.cluster_id IS UNIQUE',
            'CREATE CONSTRAINT IF NOT EXISTS FOR (e:Entity) REQUIRE e.entity_id IS UNIQUE',
            'CREATE CONSTRAINT IF NOT EXISTS FOR (c:Claim) REQUIRE c.claim_id IS UNIQUE',
        ];

        for (const constraint of constraints) {
            await session.run(constraint);
            console.log(`Executed: ${constraint}`);
        }

        // Indexes
        const indexes = [
            'CREATE INDEX IF NOT EXISTS FOR (p:Page) ON (p.cluster_id)',
        ];

        for (const index of indexes) {
            await session.run(index);
            console.log(`Executed: ${index}`);
        }

        console.log("Schema setup complete.");

    } catch (error) {
        console.error("Error setting up schema:", error);
    } finally {
        await session.close();
        await driver.close();
    }
}

setupSchema();
