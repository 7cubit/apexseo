import { getDriver } from '@apexseo/shared';
import { ClickHouseLinkSuggestionRepository, LinkSuggestion } from '@apexseo/shared';
import { Context } from '@temporalio/activity';

export async function generateLinkSuggestions(projectId: string, siteId: string): Promise<{ count: number }> {
    console.log(`[LinkSuggestion] ACTIVITY STARTED for project ${projectId}, site ${siteId}`);

    const driver = getDriver();
    if (!driver) {
        console.error('[LinkSuggestion] Neo4j driver not initialized');
        throw new Error('Neo4j driver not initialized');
    }

    const session = driver.session();
    try {
        const query = `
            MATCH (p1:Page)-[:BELONGS_TO_CLUSTER]->(c:Cluster)<-[:BELONGS_TO_CLUSTER]-(p2:Page)
            WHERE p1.page_id <> p2.page_id
            AND NOT (p1)-[:LINKS_TO]->(p2)
            
            WITH p1, p2, c
            
            RETURN 
                p1.page_id as source_page_id,
                p1.title as source_title,
                p2.page_id as target_page_id,
                p2.title as target_title,
                c.name as cluster_name
            LIMIT 50
        `;

        const result = await session.run(query, { siteId });
        console.log(`[LinkSuggestion] Neo4j query returned ${result.records.length} records`);

        const suggestions: LinkSuggestion[] = result.records.map((record: any) => {
            const sourceTitle = record.get('source_title');
            const targetTitle = record.get('target_title');
            const clusterName = record.get('cluster_name');

            return {
                source_page_id: record.get('source_page_id'),
                target_page_id: record.get('target_page_id'),
                anchor_text: `Read more about ${targetTitle || 'this topic'}`,
                relevance_score: 0.85,
                reason: `Both pages belong to cluster '${clusterName}'. Source page has high authority.`
            };
        });

        // 2. Save to ClickHouse
        if (suggestions.length > 0) {
            console.log(`[LinkSuggestion] Saving ${suggestions.length} suggestions to ClickHouse`);
            await ClickHouseLinkSuggestionRepository.saveSuggestions(suggestions);
        } else {
            console.log('[LinkSuggestion] No suggestions to save');
        }

        return { count: suggestions.length };

    } catch (error) {
        console.error('Failed to generate link suggestions', error);
        throw error;
    } finally {
        await session.close();
    }
}
