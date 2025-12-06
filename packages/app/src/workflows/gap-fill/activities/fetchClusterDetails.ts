import { driver, DATABASE } from '../../../lib/neo4j/driver';
import { ClusterDetails } from '../types';

export async function fetchClusterDetails(
    clusterId: string,
    myDomain: string,
    competitorDomain: string
): Promise<ClusterDetails> {
    if (!driver) throw new Error("Neo4j driver not initialized");

    const session = driver.session({ database: DATABASE });
    try {
        // Query to find:
        // 1. All keywords in the cluster
        // 2. Keywords the competitor ranks for
        // 3. Keywords I rank for (to determine missing)

        // Note: In a real scenario, we check [:RANKS_FOR] relationships.
        // For this implementation, we'll assume a simplified check or mock if data is missing.

        const result = await session.run(
            `
            MATCH (c:Cluster {id: $clusterId})
            OPTIONAL MATCH (c)<-[:BELONGS_TO]-(k:Keyword)
            
            // Check competitor coverage
            OPTIONAL MATCH (k)<-[:RANKS_FOR]-(cp:Page)-[:BELONGS_TO]->(comp:Competitor {domain: $competitorDomain})
            
            // Check my coverage
            OPTIONAL MATCH (k)<-[:RANKS_FOR]-(mp:Page)-[:BELONGS_TO]->(me:MyDomain {domain: $myDomain})
            
            RETURN 
                c.name as cluster_name,
                collect(DISTINCT k.text) as all_keywords,
                collect(DISTINCT CASE WHEN cp IS NOT NULL AND mp IS NULL THEN k.text ELSE NULL END) as missing_keywords
            `,
            { clusterId, competitorDomain, myDomain }
        );

        if (result.records.length === 0) {
            throw new Error(`Cluster not found: ${clusterId}`);
        }

        const record = result.records[0];
        return {
            cluster_id: clusterId,
            cluster_name: record.get('cluster_name'),
            all_keywords: record.get('all_keywords'),
            missing_keywords: record.get('missing_keywords').filter((k: string | null) => k !== null)
        };
    } finally {
        await session.close();
    }
}
