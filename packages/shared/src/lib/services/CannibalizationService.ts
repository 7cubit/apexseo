import { client } from '../clickhouse';
import { AlertService } from './AlertService';

export interface CannibalizationIssue {
    keyword: string;
    urls: string[];
    ranks: number[];
    priority: 'High' | 'Medium' | 'Low';
}

export class CannibalizationService {
    static async analyze(siteId: string): Promise<CannibalizationIssue[]> {
        // Mock implementation for now
        return [];
    }

    static async detectCannibalization(siteId: string) {
        if (!client) return;

        // 1. Find keywords that multiple pages are ranking for (e.g., in top 20)
        // This assumes we have a 'rankings' table populated by RankTracker
        // For now, we'll mock the query logic or use a placeholder table 'keyword_rankings'

        try {
            const query = `
                SELECT 
                    keyword, 
                    groupArray(url) as urls,
                    groupArray(rank) as ranks
                FROM keyword_rankings
                WHERE site_id = {siteId:String} AND rank <= 20
                GROUP BY keyword
                HAVING length(urls) > 1
            `;

            // Since we don't have the table yet, this might fail if run.
            // We'll wrap in try/catch and just log for now, or assume table exists.
            // Actually, let's define the logic but maybe not run it until table exists.

            // For the purpose of this task, let's assume we can query.
            /*
            const result = await client.query({
                query,
                query_params: { siteId },
                format: 'JSONEachRow'
            });
            const conflicts = await result.json();

            for (const conflict of conflicts) {
                await AlertService.createAlert(
                    siteId, 
                    'warning', 
                    `Cannibalization detected for keyword "${conflict.keyword}"`,
                    `Pages competing: ${conflict.urls.join(', ')}`
                );
            }
            */

            // Mock implementation for MVP
            console.log(`Checking cannibalization for ${siteId}...`);
            // Simulate finding a conflict
            // await AlertService.createAlert(siteId, 'warning', 'Potential cannibalization detected', 'Multiple pages ranking for "best seo tools"');

        } catch (error) {
            console.error('Failed to detect cannibalization:', error);
        }
    }

    static async detectVectorSimilarity(siteId: string) {
        // Detect pages with very high cosine similarity (near duplicates)
        // This requires vector search capabilities or all-pairs comparison (expensive)
        // We can use a simplified approach: check for pages in same cluster with > 0.95 similarity

        // Placeholder logic
        console.log(`Checking vector similarity for ${siteId}...`);
    }
}
