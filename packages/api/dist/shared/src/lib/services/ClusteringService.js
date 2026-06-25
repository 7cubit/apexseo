"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClusteringService = void 0;
const ClickHouseEmbeddingStore_1 = require("../clickhouse/repositories/ClickHouseEmbeddingStore");
const ClickHouseClusterStore_1 = require("../clickhouse/repositories/ClickHouseClusterStore");
const neo4j_1 = require("../neo4j");
const ml_kmeans_1 = require("ml-kmeans");
class ClusteringService {
    static async runClustering(siteId, k = 5) {
        console.log(`Running clustering for ${siteId} with k=${k}`);
        // 1. Fetch embeddings
        const data = await ClickHouseEmbeddingStore_1.ClickHouseEmbeddingStore.getAllEmbeddings(siteId);
        if (data.length < k) {
            console.warn(`Not enough data points (${data.length}) for k=${k}`);
            return;
        }
        const vectors = data.map(d => d.embedding);
        const pageIds = data.map(d => d.pageId);
        // 2. Run K-Means
        const result = (0, ml_kmeans_1.kmeans)(vectors, k, { initialization: 'kmeans++' });
        // 3. Process results
        const clusters = new Map();
        result.clusters.forEach((clusterId, index) => {
            var _a;
            if (!clusters.has(clusterId))
                clusters.set(clusterId, []);
            (_a = clusters.get(clusterId)) === null || _a === void 0 ? void 0 : _a.push(pageIds[index]);
        });
        // 4. Persist to Neo4j and ClickHouse
        const driver = (0, neo4j_1.getDriver)();
        if (!driver)
            return;
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
                await ClickHouseClusterStore_1.ClickHouseClusterStore.saveCluster({
                    site_id: siteId,
                    cluster_id: clusterUuid,
                    label: clusterLabel,
                    keywords: [], // Placeholder
                    page_count: pIds.length,
                    avg_health_score: 0 // Placeholder, calculate later
                });
            }
            console.log(`Clustering completed for ${siteId}`);
        }
        catch (error) {
            console.error('Error saving clusters:', error);
            throw error;
        }
        finally {
            await session.close();
        }
    }
}
exports.ClusteringService = ClusteringService;
