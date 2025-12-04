import { client } from '../client';

export interface ContentAudit {
    site_id: string;
    page_id: string;
    audit_id: string;
    audit_date?: string;
    nlp_term_coverage: number;
    semantic_similarity: number;
    content_depth_score: number;
    missing_entities: string[];
    missing_topics: string[];
    competitor_coverage: number;
    serp_keyword: string;
    competitor_count: number;
    user_embedding: number[];
    serp_centroid: number[];
    recommendations: string[];
    priority: string;
}

export class ClickHouseContentAuditRepository {
    /**
     * Create the content_audits table if it doesn't exist.
     */
    static async createTable(): Promise<void> {
        if (!client) {
            console.warn('ClickHouse client not initialized');
            return;
        }

        const query = `
            CREATE TABLE IF NOT EXISTS content_audits (
                site_id String,
                page_id String,
                audit_id String,
                audit_date DateTime DEFAULT now(),
                
                nlp_term_coverage Float32,
                semantic_similarity Float32,
                content_depth_score Float32,
                
                missing_entities Array(String),
                missing_topics Array(String),
                competitor_coverage Float32,
                
                serp_keyword String,
                competitor_count UInt16,
                user_embedding Array(Float32),
                serp_centroid Array(Float32),
                
                recommendations Array(String),
                priority String,
                
                created_at DateTime DEFAULT now(),
                updated_at DateTime DEFAULT now()
                
            ) ENGINE = MergeTree()
            ORDER BY (site_id, page_id, audit_date)
            PARTITION BY toYYYYMM(audit_date);
        `;

        try {
            await client.command({ query });
            console.log('✅ content_audits table initialized');
        } catch (error) {
            console.error('Failed to create content_audits table:', error);
            throw error;
        }
    }

    /**
     * Save a content audit result.
     */
    static async saveAudit(audit: ContentAudit): Promise<void> {
        if (!client) {
            console.warn('ClickHouse client not initialized');
            return;
        }

        try {
            await client.insert({
                table: 'content_audits',
                values: [{
                    ...audit,
                    audit_date: audit.audit_date || new Date().toISOString().replace('T', ' ').split('.')[0],
                    created_at: new Date().toISOString().replace('T', ' ').split('.')[0],
                    updated_at: new Date().toISOString().replace('T', ' ').split('.')[0]
                }],
                format: 'JSONEachRow'
            });
            console.log(`✅ Saved content audit for page ${audit.page_id}`);
        } catch (error) {
            console.error('Failed to save content audit:', error);
            throw error;
        }
    }

    /**
     * Get the latest audit for a specific page.
     */
    static async getLatestAudit(pageId: string): Promise<ContentAudit | null> {
        if (!client) return null;

        try {
            const result = await client.query({
                query: `
                    SELECT * FROM content_audits 
                    WHERE page_id = {pageId:String}
                    ORDER BY audit_date DESC
                    LIMIT 1
                `,
                query_params: { pageId },
                format: 'JSONEachRow'
            });

            const rows = await result.json() as ContentAudit[];
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error('Failed to get latest audit:', error);
            return null;
        }
    }

    /**
     * Get audit history for a page.
     */
    static async getAuditHistory(pageId: string, limit: number = 10): Promise<ContentAudit[]> {
        if (!client) return [];

        try {
            const result = await client.query({
                query: `
                    SELECT * FROM content_audits 
                    WHERE page_id = {pageId:String}
                    ORDER BY audit_date DESC
                    LIMIT {limit:UInt32}
                `,
                query_params: { pageId, limit },
                format: 'JSONEachRow'
            });

            return await result.json() as ContentAudit[];
        } catch (error) {
            console.error('Failed to get audit history:', error);
            return [];
        }
    }

    /**
     * Get all audits for a site.
     */
    static async getAuditsBySite(siteId: string, limit: number = 100): Promise<ContentAudit[]> {
        if (!client) return [];

        try {
            const result = await client.query({
                query: `
                    SELECT * FROM content_audits 
                    WHERE site_id = {siteId:String}
                    ORDER BY audit_date DESC
                    LIMIT {limit:UInt32}
                `,
                query_params: { siteId, limit },
                format: 'JSONEachRow'
            });

            return await result.json() as ContentAudit[];
        } catch (error) {
            console.error('Failed to get audits by site:', error);
            return [];
        }
    }

    /**
     * Get pages with low content depth scores (need improvement).
     */
    static async getLowScorePages(siteId: string, threshold: number = 50): Promise<ContentAudit[]> {
        if (!client) return [];

        try {
            const result = await client.query({
                query: `
                    SELECT * FROM (
                        SELECT *, 
                               ROW_NUMBER() OVER (PARTITION BY page_id ORDER BY audit_date DESC) as rn
                        FROM content_audits
                        WHERE site_id = {siteId:String}
                    ) WHERE rn = 1 AND content_depth_score < {threshold:Float32}
                    ORDER BY content_depth_score ASC
                    LIMIT 50
                `,
                query_params: { siteId, threshold },
                format: 'JSONEachRow'
            });

            return await result.json() as ContentAudit[];
        } catch (error) {
            console.error('Failed to get low score pages:', error);
            return [];
        }
    }

    /**
     * Get aggregate statistics for a site.
     */
    static async getSiteStats(siteId: string): Promise<{
        avgDepthScore: number;
        avgTermCoverage: number;
        avgSemanticSimilarity: number;
        totalAudits: number;
        criticalPages: number;
    }> {
        if (!client) {
            return {
                avgDepthScore: 0,
                avgTermCoverage: 0,
                avgSemanticSimilarity: 0,
                totalAudits: 0,
                criticalPages: 0
            };
        }

        try {
            const result = await client.query({
                query: `
                    SELECT 
                        avg(content_depth_score) as avgDepthScore,
                        avg(nlp_term_coverage) as avgTermCoverage,
                        avg(semantic_similarity) as avgSemanticSimilarity,
                        count() as totalAudits,
                        countIf(content_depth_score < 50) as criticalPages
                    FROM (
                        SELECT *, 
                               ROW_NUMBER() OVER (PARTITION BY page_id ORDER BY audit_date DESC) as rn
                        FROM content_audits
                        WHERE site_id = {siteId:String}
                    ) WHERE rn = 1
                `,
                query_params: { siteId },
                format: 'JSONEachRow'
            });

            const rows = await result.json() as any[];
            return rows[0] || {
                avgDepthScore: 0,
                avgTermCoverage: 0,
                avgSemanticSimilarity: 0,
                totalAudits: 0,
                criticalPages: 0
            };
        } catch (error) {
            console.error('Failed to get site stats:', error);
            return {
                avgDepthScore: 0,
                avgTermCoverage: 0,
                avgSemanticSimilarity: 0,
                totalAudits: 0,
                criticalPages: 0
            };
        }
    }
}
