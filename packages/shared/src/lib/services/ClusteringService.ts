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
    static async clusterKeywordsSemantically(seedKeyword: string, rawKeywords: string[], serpData: any[]) {
        const { openai } = await import('../openai');

        console.log(`Running semantic analysis via LLM...`);

        const prompt = `
# Role
You are the ApexSEO Semantic Architect, a world-class SEO strategist specializing in Topic Clustering and Keyword Intent mapping.

# Objective
Analyze the provided {{seed_keyword}} and the list of {{raw_keywords}}. Organize this unstructured data into a "Semantic Graph" structure that minimizes cannibalization and maximizes topical authority.

# Analysis Instructions
1. **Intent Classification**: Classify every keyword as Informational, Commercial, Transactional, or Navigational.
2. **Cluster Grouping**: Group keywords that share the *exact same* SERP intent. If two keywords trigger the same Wikipedia page or competitor article, they belong in the same cluster.
3. **Difficulty Estimation**: Estimate a "Rank Friction" score (0-100) based on the domain authority of the provided {{serp_data}}.

# Input Data
- Seed Keyword: "${seedKeyword}"
- Raw Keywords: ${JSON.stringify(rawKeywords)}
- SERP Data Context: ${JSON.stringify(serpData.map(s => ({ domain: s.domain, domain_authority: s.da }))).substring(0, 2000)}

# Output Format (Strict JSON)
Return ONLY a JSON object with this schema:
{
  "clusters": [
    {
      "cluster_name": "String (The primary parent keyword)",
      "search_volume_sum": "Integer (Estimate based on count if unknown)",
      "intent": "String",
      "kd_score": "Integer",
      "child_keywords": ["String", "String", "String"],
      "content_angle": "String (e.g., 'Comparison Guide' or 'How-to Tutorial')"
    }
  ]
}
`;

        try {
            const response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: "You are a JSON-only API. Return valid JSON only." },
                    { role: "user", content: prompt }
                ],
                response_format: { type: "json_object" }
            });

            const content = response.choices[0].message.content;
            if (!content) return [];

            const result = JSON.parse(content);

            // Persist to Neo4j
            const driver = getDriver();
            if (driver && result.clusters) {
                const session = driver.session();
                try {
                    // Create Strategy Node (Optional, or just link clusters to Project/Seed)
                    // For now, let's treat Seed Keyword as the main topic or create a Strategy node
                    // We'll create clusters and link keywords

                    for (const cluster of result.clusters) {
                        await session.run(`
                            MERGE (c:Cluster {id: $clusterId})
                            SET c.label = $name, 
                                c.search_volume = $vol, 
                                c.difficulty = $kd, 
                                c.intent = $intent,
                                c.content_angle = $angle,
                                c.seed_keyword = $seed,
                                c.created_at = datetime()
                            
                            WITH c
                            UNWIND $keywords as kw
                            MERGE (k:Keyword {id: kw})
                            SET k.term = kw
                            MERGE (k)-[:BELONGS_TO_CLUSTER]->(c)
                        `, {
                            clusterId: `${seedKeyword}-${cluster.cluster_name}`,
                            name: cluster.cluster_name,
                            vol: cluster.search_volume_sum,
                            kd: cluster.kd_score,
                            intent: cluster.intent,
                            angle: cluster.content_angle,
                            seed: seedKeyword,
                            keywords: cluster.child_keywords
                        });
                    }
                } catch (dbError) {
                    console.error("Failed to persist semantic clusters to Neo4j:", dbError);
                } finally {
                    await session.close();
                }
            }

            return result.clusters;
        } catch (error) {
            console.error("Semantic clustering failed:", error);
            return [];
        }
    }
}
