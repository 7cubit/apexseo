import { ClickHouseEmbeddingStore } from '../clickhouse/repositories/ClickHouseEmbeddingStore';
import { ClickHouseClusterStore } from '../clickhouse/repositories/ClickHouseClusterStore';
import { getDriver } from '../neo4j';
import { kmeans } from 'ml-kmeans';

export class ClusteringService {
    static async runClustering(siteId: string, k: number = 5) {
        console.log(`Running clustering for ${siteId} with k=${k}`);

        // 1. Fetch embeddings
        const data = await ClickHouseEmbeddingStore.getAllEmbeddings(siteId);
        if (data.length < k) {
            console.warn(`Not enough data points (${data.length}) for k=${k}`);
            return;
        }

        const vectors = data.map(d => d.embedding);
        const pageIds = data.map(d => d.pageId);

        // 2. Run K-Means
        const result = kmeans(vectors, k, { initialization: 'kmeans++' });

        // 3. Process results
        const clusters = new Map<number, string[]>();
        result.clusters.forEach((clusterId, index) => {
            if (!clusters.has(clusterId)) clusters.set(clusterId, []);
            clusters.get(clusterId)?.push(pageIds[index]);
        });

        // 4. Persist to Neo4j and ClickHouse
        const driver = getDriver();
        if (!driver) return;
        const session = driver.session();

        try {
            for (const [clusterId, pIds] of Array.from(clusters.entries())) {
                const clusterLabel = `Cluster ${clusterId}`; // In real app, generate label via LLM
                const clusterUuid = `${siteId}-cluster-${clusterId}`;

                // Update Neo4j
                await session.run(`
                    MERGE (c:Cluster {id: $clusterUuid})
                    SET c.label = $clusterLabel, c.site_id = $siteId
                    WITH c
                    UNWIND $pIds as pageId
                    MATCH (p:Page {page_id: pageId})
                    MERGE (p)-[:BELONGS_TO_CLUSTER]->(c)
                `, { clusterUuid, clusterLabel, siteId, pIds });

                // Update ClickHouse Cluster Store
                await ClickHouseClusterStore.saveCluster({
                    site_id: siteId,
                    cluster_id: clusterUuid,
                    label: clusterLabel,
                    keywords: [], // Placeholder
                    page_count: pIds.length,
                    avg_health_score: 0 // Placeholder, calculate later
                });
            }
            console.log(`Clustering completed for ${siteId}`);
        } catch (error) {
            console.error('Error saving clusters:', error);
            throw error;
        } finally {
            await session.close();
        }
    }
}
