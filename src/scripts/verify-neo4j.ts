import neo4j from 'neo4j-driver';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

(async () => {
    const URI = process.env.NEO4J_URI;
    const USER = process.env.NEO4J_USER;
    const PASSWORD = process.env.NEO4J_PASSWORD;

    if (!URI || !USER || !PASSWORD) {
        console.error("Missing Neo4j environment variables.");
        process.exit(1);
    }

    const driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));

    try {
        // Verify connection
        const serverInfo = await driver.getServerInfo();
        console.log('Connection established');
        console.log(serverInfo);

        // Create Example
        let { summary: createSummary } = await driver.executeQuery(`
      CREATE (a:Person {name: $name})
      CREATE (b:Person {name: $friendName})
      CREATE (a)-[:KNOWS]->(b)
      `,
            { name: 'Alice', friendName: 'David' },
            { database: 'neo4j' }
        );
        console.log(
            `Created ${createSummary.counters.updates().nodesCreated} nodes ` +
            `in ${createSummary.resultAvailableAfter} ms.`
        );

        // Query Example
        let { records, summary: querySummary } = await driver.executeQuery(`
      MATCH (p:Person)-[:KNOWS]->(:Person)
      RETURN p.name AS name
      `,
            {},
            { database: 'neo4j' }
        );

        // Loop through users
        for (let record of records) {
            console.log(`Person with name: ${record.get('name')}`);
            console.log(`Available properties for this node are: ${record.keys}\n`);
        }

        // Summary information
        console.log(
            `The query \`${querySummary.query.text}\` ` +
            `returned ${records.length} nodes.\n`
        );

    } catch (error) {
        console.error("Neo4j verification failed:", error);
    } finally {
        await driver.close();
    }
})();
