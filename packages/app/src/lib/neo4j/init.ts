import { driver, DATABASE } from './driver';

export async function initNeo4jConstraints() {
    if (!driver) {
        console.error("Neo4j driver not initialized");
        return;
    }

    const session = driver.session({ database: DATABASE });

    const constraints = [
        // Constraints
        'CREATE CONSTRAINT topic_id IF NOT EXISTS FOR (t:Topic) REQUIRE t.id IS UNIQUE',
        'CREATE CONSTRAINT cluster_id IF NOT EXISTS FOR (c:Cluster) REQUIRE c.id IS UNIQUE',
        'CREATE CONSTRAINT keyword_id IF NOT EXISTS FOR (k:Keyword) REQUIRE k.id IS UNIQUE',
        'CREATE CONSTRAINT competitor_domain IF NOT EXISTS FOR (c:Competitor) REQUIRE c.domain IS UNIQUE',
        'CREATE CONSTRAINT page_url IF NOT EXISTS FOR (p:Page) REQUIRE p.url IS UNIQUE',

        // Indexes
        'CREATE INDEX keyword_text IF NOT EXISTS FOR (k:Keyword) ON (k.text)',
        'CREATE INDEX cluster_semantic IF NOT EXISTS FOR (c:Cluster) ON (c.semantic_centroid)'
    ];

    try {
        console.log("Initializing Neo4j Constraints...");
        for (const query of constraints) {
            await session.run(query);
            console.log(`Executed: ${query}`);
        }
        console.log("Neo4j Constraints Initialized Successfully.");
    } catch (error) {
        console.error("Failed to initialize Neo4j constraints:", error);
    } finally {
        await session.close();
    }
}
