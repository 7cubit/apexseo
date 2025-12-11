import { OpenAI } from 'openai';
import { driver, DATABASE } from './neo4j/driver';
import { DataForSEOClient } from './dataforseo';

// Interfaces
export interface TopicCluster {
    id: string;
    name: string;
    primaryKeyword: string;
    relatedKeywords: string[];
    searchVolume: number;
    difficulty: number;
    contentType: 'How-To Guide' | 'Product Page' | 'Blog Post' | 'Landing Page';
    status: 'Not Covered' | 'Partially Covered' | 'Fully Covered';
    competitorCoverage: number; // 0-100%
    competitors: string[]; // List of domains covering this
}

export interface TopicMap {
    projectId: string;
    seedKeyword: string;
    clusters: TopicCluster[];
}

export class TopicalMapService {
    private openai: OpenAI;
    private dataForSEO: DataForSEOClient;

    constructor() {
        this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        this.dataForSEO = new DataForSEOClient();
    }

    async generateTopicClusters(seedKeyword: string, projectId: string): Promise<TopicMap> {
        console.log(`Generating topic clusters for: ${seedKeyword}`);

        // Step 1: Get keyword ideas
        let keywordData = await this.dataForSEO.getKeywordIdeas(seedKeyword, 2840, 'en', 100);

        // Fallback if API fails or returns empty (e.g. dev env without creds)
        if (!keywordData || keywordData.length === 0) {
            console.warn("DataForSEO returned no data, using mock data for demonstration.");
            keywordData = [
                { keyword: seedKeyword, vol: 12000, diff: 45 },
                { keyword: `best ${seedKeyword}`, vol: 5400, diff: 30 },
                { keyword: `${seedKeyword} guide`, vol: 3200, diff: 25 },
                { keyword: `how to use ${seedKeyword}`, vol: 2100, diff: 20 },
                { keyword: `${seedKeyword} vs competitor`, vol: 1500, diff: 35 },
                { keyword: `${seedKeyword} pricing`, vol: 900, diff: 50 },
                { keyword: `${seedKeyword} examples`, vol: 800, diff: 15 },
                { keyword: `advanced ${seedKeyword}`, vol: 600, diff: 60 },
                { keyword: `${seedKeyword} tutorial`, vol: 4500, diff: 22 },
                { keyword: `${seedKeyword} benefits`, vol: 1200, diff: 18 }
            ];
        }

        // Step 2: Semantic Clustering via LLM
        const prompt = `
        ACT AS: SEMANTIC KEYWORD CLUSTERER
        
        INPUTS:
        - Seed Keyword: "${seedKeyword}"
        - Related Keywords: ${JSON.stringify(keywordData.map(k => k.keyword))}
        
        TASK:
        Group these keywords into Topic Clusters based on:
        1. Search Intent (informational, commercial, navigational)
        2. Semantic Similarity
        3. SERP Overlap
        
        RULES:
        - Each cluster must have related keywords
        - Cluster names should be actionable content topics
        - Assign a "Content Type"
        
        OUTPUT (JSON):
        {
            "clusters": [
                {
                    "name": "Cluster Name",
                    "primaryKeyword": "main keyword",
                    "relatedKeywords": ["kw1", "kw2"],
                    "contentType": "Blog Post"
                }
            ]
        }
        `;

        let clusters: any[] = [];
        try {
            const completion = await this.openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [{ role: 'user', content: prompt }],
                response_format: { type: "json_object" }
            });
            const parsed = JSON.parse(completion.choices[0].message.content || '{}');
            clusters = parsed.clusters || [];
        } catch (e) {
            console.error("LLM Clustering failed, using fallback", e);
            // Fallback: Single cluster
            clusters = [{
                name: `${seedKeyword} Guide`,
                primaryKeyword: seedKeyword,
                relatedKeywords: keywordData.map(k => k.keyword).slice(1),
                contentType: 'How-To Guide'
            }];
        }

        // Step 3: Enrich with Metrics & Status
        const enrichedClusters: TopicCluster[] = clusters.map((c: any) => {
            const primaryMetric = keywordData.find(k => k.keyword === c.primaryKeyword) || keywordData[0];
            return {
                id: crypto.randomUUID(),
                name: c.name,
                primaryKeyword: c.primaryKeyword,
                relatedKeywords: c.relatedKeywords,
                searchVolume: primaryMetric.vol,
                difficulty: primaryMetric.diff,
                contentType: c.contentType,
                status: 'Not Covered', // Default
                competitorCoverage: Math.floor(Math.random() * 100), // Mock coverage
                competitors: ['competitor-a.com', 'competitor-b.com'] // Mock competitors
            };
        });

        const topicMap: TopicMap = {
            projectId,
            seedKeyword,
            clusters: enrichedClusters
        };

        // Step 4: Store in Neo4j (Async)
        await this.saveTopicMap(topicMap);

        return topicMap;
    }

    async saveTopicMap(map: TopicMap) {
        if (!driver) return;
        const session = driver.session({ database: DATABASE });
        try {
            await session.run(
                `
                MATCH (p:Project {id: $projectId})
                MERGE (t:Topic {id: $seed, name: $seed, root: true})
                
                WITH t
                UNWIND $clusters as c
                MERGE (cl:Cluster {id: c.id})
                SET cl += {
                    name: c.name,
                    semantic_embedding: c.semantic_embedding, // Ensure this is passed or defaulted
                    total_keywords: size(c.relatedKeywords),
                    avg_difficulty: c.difficulty,
                    total_volume: c.searchVolume,
                    created_at: datetime()
                }
                MERGE (t)-[:CONTAINS]->(cl)
                
                WITH cl, c
                UNWIND c.relatedKeywords as rk
                MERGE (k:Keyword {text: rk})
                SET k.id = 'kw-' + apoc.text.slug(rk) // Generate ID if missing
                MERGE (k)-[:BELONGS_TO {embedding_confidence: 0.95}]->(cl)
                `,
                {
                    projectId: map.projectId,
                    seed: map.seedKeyword,
                    clusters: map.clusters.map(c => ({
                        ...c,
                        semantic_embedding: new Array(768).fill(0) // Placeholder if missing
                    }))
                }
            );
        } catch (e) {
            console.error("Failed to save topic map to Neo4j", e);
        } finally {
            await session.close();
        }
    }

    async getTopicMap(projectId: string): Promise<TopicMap | null> {
        // Mock retrieval for now if DB fails or empty
        return null;
    }

    /**
     * Apex Gap Score Algorithm
     * Formula: (Competitor_Coverage * 0.4) + (Norm_Volume * 0.4) + (Semantic_Imp * 0.2) - (My_Coverage * 0.8)
     */
    calculateGapScore(
        competitorCoverage: number, // 0-100
        volume: number,
        semanticImportance: number, // 0-1
        myCoverage: number // 0-100
    ): number {
        // Normalize Volume (Log scale: 0-10000 -> 0-1 approx)
        // We use log10 to dampen the effect of massive volume keywords
        const normVol = Math.min(1, Math.log10(volume + 1) / 5);

        const score = (
            ((competitorCoverage / 100) * 0.4) +
            (normVol * 0.4) +
            (semanticImportance * 0.2)
        ) - ((myCoverage / 100) * 0.8);

        // Clamp between 0 and 1
        return Math.max(0, Math.min(1, score));
    }

    async predictRankingDifficulty(keyword: string): Promise<DifficultyReport> {
        const serpData = await this.dataForSEO.getSERPResults(keyword);

        const factors = {
            avgDomainAuthority: serpData.top10.reduce((sum: number, r: any) => sum + r.domainAuthority, 0) / 10,
            avgPageAuthority: serpData.top10.reduce((sum: number, r: any) => sum + r.pageAuthority, 0) / 10,
            avgBacklinks: serpData.top10.reduce((sum: number, r: any) => sum + r.backlinks, 0) / 10,
            avgWordCount: serpData.top10.reduce((sum: number, r: any) => sum + r.wordCount, 0) / 10,
            brandDominance: serpData.top10.filter((r: any) => r.isBrandedSite).length,
            featuredSnippetPresent: serpData.features.includes('featured_snippet')
        };

        // Weighted scoring
        const difficulty = (
            factors.avgDomainAuthority * 0.3 +
            factors.avgPageAuthority * 0.2 +
            Math.log10(factors.avgBacklinks + 1) * 0.2 +
            (factors.avgWordCount / 100) * 0.1 +
            factors.brandDominance * 5 +
            (factors.featuredSnippetPresent ? 10 : 0)
        );

        return {
            score: Math.min(difficulty, 100),
            factors,
            recommendation: difficulty < 30 ? 'Quick Win' : difficulty < 60 ? 'Moderate Effort' : 'Long-term Investment'
        };
    }
}

export interface DifficultyReport {
    score: number;
    factors: {
        avgDomainAuthority: number;
        avgPageAuthority: number;
        avgBacklinks: number;
        avgWordCount: number;
        brandDominance: number;
        featuredSnippetPresent: boolean;
    };
    recommendation: 'Quick Win' | 'Moderate Effort' | 'Long-term Investment';
}
