import {
    ClickHouseEmbeddingStore,
    ClickHousePageRepository,
    ClickHouseContentAuditRepository,
    VectorMath,
    EntityExtractor,
    type ExtractedEntity
} from '@apexseo/shared';
import { v4 as uuidv4 } from 'uuid';

export interface ContentScoreInput {
    siteId: string;
    pageId: string;
    keyword: string; // Target keyword for SERP comparison
    competitorEmbeddings?: number[][]; // Optional: pre-fetched competitor embeddings
    competitorContents?: string[]; // Optional: pre-fetched competitor content
}

export interface ContentScoreOutput {
    nlp_term_coverage: number;
    semantic_similarity: number;
    content_depth_score: number;
    missing_entities: string[];
    missing_topics: string[];
    recommendations: string[];
    priority: string;
}

/**
 * Calculate semantic content score by comparing against SERP competitors.
 * This is the CORE activity that implements the "semantic depth" concept.
 * 
 * Instead of counting words, we:
 * 1. Compare user embedding to SERP competitor centroid (cosine similarity)
 * 2. Extract entities and find missing topics
 * 3. Calculate NLP term coverage
 * 4. Generate actionable recommendations
 */
export async function calculateContentScore(input: ContentScoreInput): Promise<ContentScoreOutput> {
    console.log(`[ContentScore] Starting analysis for page ${input.pageId}, keyword: "${input.keyword}"`);

    try {
        // 1. Get user page embedding from ClickHouse
        const userEmbedding = await ClickHouseEmbeddingStore.getEmbedding(input.siteId, input.pageId);
        if (!userEmbedding || userEmbedding.length === 0) {
            throw new Error(`No embedding found for page ${input.pageId}. Run embedding generation first.`);
        }
        console.log(`[ContentScore] Retrieved user embedding (${userEmbedding.length} dimensions)`);

        // 2. Get user page content
        const userPage = await ClickHousePageRepository.getPageById(input.pageId);
        if (!userPage || !userPage.content) {
            throw new Error(`No content found for page ${input.pageId}`);
        }
        console.log(`[ContentScore] Retrieved user content (${userPage.content.length} chars)`);

        // 3. Extract user entities
        const userEntities = EntityExtractor.extractEntities(userPage.content);
        console.log(`[ContentScore] Extracted ${userEntities.length} entities from user content`);

        // 4. Get SERP competitor data (mock for now, will integrate real SERP API later)
        let serpCompetitorEmbeddings: number[][];
        let serpCompetitorContents: string[];

        if (input.competitorEmbeddings && input.competitorContents) {
            // Use provided competitor data
            serpCompetitorEmbeddings = input.competitorEmbeddings;
            serpCompetitorContents = input.competitorContents;
            console.log(`[ContentScore] Using provided competitor data (${serpCompetitorEmbeddings.length} competitors)`);
        } else {
            // Mock SERP competitors (in production, fetch from SERP API)
            console.log(`[ContentScore] ⚠️  Using MOCK competitor data. Integrate real SERP API for production.`);
            serpCompetitorEmbeddings = await getMockCompetitorEmbeddings(input.keyword);
            serpCompetitorContents = await getMockCompetitorContents(input.keyword);
        }

        // 5. Calculate SERP centroid (average of all competitor embeddings)
        const serpCentroid = VectorMath.calculateCentroid(serpCompetitorEmbeddings);
        console.log(`[ContentScore] Calculated SERP centroid from ${serpCompetitorEmbeddings.length} competitors`);

        // 6. Calculate cosine similarity between user embedding and SERP centroid
        const semanticSimilarity = VectorMath.cosineSimilarity(userEmbedding, serpCentroid);
        console.log(`[ContentScore] Semantic similarity: ${(semanticSimilarity * 100).toFixed(2)}%`);

        // 7. Extract competitor entities
        const allCompetitorEntities: ExtractedEntity[] = [];
        for (const content of serpCompetitorContents) {
            const entities = EntityExtractor.extractEntities(content);
            allCompetitorEntities.push(...entities);
        }
        console.log(`[ContentScore] Extracted ${allCompetitorEntities.length} total entities from competitors`);

        // 8. Find missing entities (entities in competitors but not in user content)
        const missingEntities = EntityExtractor.findMissingEntities(userEntities, allCompetitorEntities);
        const topMissingEntities = EntityExtractor.getTopMissingEntities(missingEntities, 10);
        console.log(`[ContentScore] Found ${missingEntities.length} missing entities (top 10 prioritized)`);

        // 9. Calculate NLP term coverage
        const nlp_term_coverage = EntityExtractor.calculateTermCoverage(userEntities, allCompetitorEntities);
        console.log(`[ContentScore] NLP term coverage: ${nlp_term_coverage.toFixed(2)}%`);

        // 10. Calculate content depth score (weighted combination)
        // 60% weight on semantic similarity, 40% weight on term coverage
        const content_depth_score = (
            semanticSimilarity * 0.6 +
            (nlp_term_coverage / 100) * 0.4
        ) * 100;
        console.log(`[ContentScore] Content depth score: ${content_depth_score.toFixed(2)}/100`);

        // 11. Generate recommendations
        const recommendations = generateRecommendations(
            topMissingEntities,
            semanticSimilarity,
            nlp_term_coverage,
            content_depth_score
        );

        // 12. Determine priority
        const priority = content_depth_score < 50 ? 'critical' :
            content_depth_score < 70 ? 'high' :
                content_depth_score < 85 ? 'medium' : 'low';

        // 13. Save audit to ClickHouse
        const auditId = uuidv4();
        await ClickHouseContentAuditRepository.saveAudit({
            site_id: input.siteId,
            page_id: input.pageId,
            audit_id: auditId,
            nlp_term_coverage,
            semantic_similarity: semanticSimilarity * 100,
            content_depth_score,
            missing_entities: topMissingEntities.map((e: ExtractedEntity) => e.text),
            missing_topics: [], // TODO: Implement topic clustering in future
            competitor_coverage: nlp_term_coverage,
            serp_keyword: input.keyword,
            competitor_count: serpCompetitorEmbeddings.length,
            user_embedding: userEmbedding,
            serp_centroid: serpCentroid,
            recommendations,
            priority
        });
        console.log(`[ContentScore] ✅ Saved audit ${auditId} to ClickHouse`);

        // 14. Update pages table with new content_score
        await updatePageContentScore(input.pageId, content_depth_score);

        return {
            nlp_term_coverage,
            semantic_similarity: semanticSimilarity * 100,
            content_depth_score,
            missing_entities: topMissingEntities.map((e: ExtractedEntity) => e.text),
            missing_topics: [],
            recommendations,
            priority
        };

    } catch (error) {
        console.error(`[ContentScore] ❌ Failed to calculate content score:`, error);
        throw error;
    }
}

/**
 * Generate actionable recommendations based on analysis results.
 */
function generateRecommendations(
    missingEntities: ExtractedEntity[],
    similarity: number,
    coverage: number,
    depthScore: number
): string[] {
    const recs: string[] = [];

    // Semantic similarity recommendations
    if (similarity < 0.6) {
        recs.push(
            `🔴 CRITICAL: Content is semantically distant from top SERP results (${(similarity * 100).toFixed(0)}% similarity). ` +
            `Consider restructuring to align with competitor themes and topics.`
        );
    } else if (similarity < 0.75) {
        recs.push(
            `🟡 Content alignment with SERP is moderate (${(similarity * 100).toFixed(0)}% similarity). ` +
            `Review top-ranking pages and incorporate similar semantic patterns.`
        );
    }

    // Term coverage recommendations
    if (coverage < 50) {
        const topMissing = missingEntities.slice(0, 5).map(e => e.text).join(', ');
        recs.push(
            `🔴 CRITICAL: Missing ${(100 - coverage).toFixed(0)}% of key terms found in competitors. ` +
            `High-priority additions: ${topMissing}`
        );
    } else if (coverage < 75) {
        const topMissing = missingEntities.slice(0, 3).map(e => e.text).join(', ');
        recs.push(
            `🟡 Add coverage for these competitor terms: ${topMissing}`
        );
    }

    // Technical term recommendations
    const techTerms = missingEntities.filter(e => e.type === 'TECH' || e.type === 'FRAMEWORK');
    if (techTerms.length > 0) {
        const topTech = techTerms.slice(0, 3).map(e => e.text).join(', ');
        recs.push(
            `💡 Technical terms to add: ${topTech}. These appear frequently in top-ranking content.`
        );
    }

    // Overall score recommendations
    if (depthScore >= 85) {
        recs.push(
            `✅ Excellent semantic depth! Content is well-aligned with SERP leaders. ` +
            `Focus on maintaining quality and freshness.`
        );
    } else if (depthScore >= 70) {
        recs.push(
            `✅ Good semantic depth. Minor improvements to entity coverage could boost rankings.`
        );
    }

    // If no specific recommendations, provide general guidance
    if (recs.length === 0) {
        recs.push(
            `Content analysis complete. Score: ${depthScore.toFixed(0)}/100. ` +
            `Continue monitoring competitor content for emerging topics.`
        );
    }

    return recs;
}

/**
 * Update the content_score field in the pages table.
 */
async function updatePageContentScore(pageId: string, score: number): Promise<void> {
    // Note: ClickHouse doesn't support UPDATE easily, so we'd need to use ALTER TABLE UPDATE
    // For now, we'll log this. In production, consider using a materialized view or
    // fetching the latest score from content_audits when displaying pages.
    console.log(`[ContentScore] Would update page ${pageId} content_score to ${score.toFixed(2)}`);

    // TODO: Implement actual update if needed
    // await client.command({
    //     query: `ALTER TABLE pages UPDATE content_score = ${score} WHERE page_id = '${pageId}'`
    // });
}

/**
 * Mock function to get competitor embeddings.
 * In production, this would fetch from SERP API + crawl + generate embeddings.
 */
async function getMockCompetitorEmbeddings(keyword: string): Promise<number[][]> {
    // Return 10 mock embeddings (384 dimensions, normalized)
    const mockEmbeddings: number[][] = [];
    for (let i = 0; i < 10; i++) {
        const embedding = Array.from({ length: 384 }, () => Math.random() - 0.5);
        mockEmbeddings.push(VectorMath.normalize(embedding));
    }
    return mockEmbeddings;
}

/**
 * Mock function to get competitor content.
 * In production, this would crawl SERP results.
 */
async function getMockCompetitorContents(keyword: string): Promise<string[]> {
    // Return mock content with relevant entities
    const mockContents = [
        `Complete guide to ${keyword}. Learn about schema markup, structured data, and SEO best practices. 
         Implement canonical URLs and meta descriptions for better rankings.`,

        `${keyword} tutorial covering React, Next.js, and modern web development. 
         Use TypeScript for type safety and Tailwind CSS for styling.`,

        `Advanced ${keyword} techniques including machine learning, embeddings, and semantic search. 
         Leverage vector databases and cosine similarity for better results.`,

        `${keyword} optimization guide. Improve page speed, Core Web Vitals (LCP, FID, CLS), 
         and mobile-first indexing. Use robots.txt and sitemaps effectively.`,

        `How to master ${keyword} with PostgreSQL, ClickHouse, and Neo4j. 
         Build scalable applications with Docker and Kubernetes on GCP.`,

        `${keyword} best practices for 2024. Focus on internal linking, anchor text optimization, 
         and crawl budget management. Avoid noindex and nofollow mistakes.`,

        `${keyword} framework comparison: Express vs Fastify vs NestJS. 
         Choose the right backend for your Node.js application.`,

        `${keyword} and AI: Using GPT-4, BERT, and transformers for natural language processing. 
         Implement entity extraction and clustering algorithms.`,

        `${keyword} performance optimization with Webpack, Vite, and modern build tools. 
         Reduce bundle size and improve load times.`,

        `${keyword} security essentials. Protect against XSS, CSRF, and SQL injection. 
         Use HTTPS, CSP headers, and proper authentication.`
    ];

    return mockContents;
}
