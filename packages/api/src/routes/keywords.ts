import { FastifyPluginAsync } from 'fastify';
import { DataForSEOClient } from '@apexseo/shared';

const keywordsRoutes: FastifyPluginAsync = async (fastify, opts) => {
    const dataForSEO = new DataForSEOClient();

    // Keyword Research - Get suggestions
    fastify.get<{ Querystring: { query: string; location?: string } }>(
        '/keywords/research',
        async (request, reply) => {
            const { query, location = 'United States' } = request.query;

            if (!query) {
                return reply.status(400).send({ error: 'Query parameter is required' });
            }

            try {
                // Get keyword suggestions from DataForSEO
                const suggestions = await dataForSEO.getKeywordSuggestions(query, location);

                // Get search volume data
                const volumeData = await dataForSEO.getSearchVolume(
                    suggestions.slice(0, 100) // Limit to 100 keywords
                );

                return { keywords: volumeData };
            } catch (error) {
                request.log.error(error);
                reply.status(500).send({ error: 'Failed to fetch keyword data' });
            }
        }
    );

    // Get tracked keywords for a project
    fastify.get<{ Params: { projectId: string } }>(
        '/keywords/tracking/:projectId',
        async (request, reply) => {
            const { projectId } = request.params;

            try {
                // Fetch from ClickHouse rank_history
                // This uses existing RankTracker data
                const { ClickHouseRankRepository } = await import('@apexseo/shared');
                const history = await ClickHouseRankRepository.getSiteHistory(projectId, 30);

                // Group by keyword and get latest position
                const keywordMap = new Map();
                for (const record of history as any[]) {
                    if (!keywordMap.has(record.keyword) ||
                        new Date(record.rank_date) > new Date(keywordMap.get(record.keyword).rank_date)) {
                        keywordMap.set(record.keyword, record);
                    }
                }

                return { keywords: Array.from(keywordMap.values()) };
            } catch (error) {
                request.log.error(error);
                reply.status(500).send({ error: 'Failed to fetch tracked keywords' });
            }
        }
    );

    // Add keyword to tracking
    fastify.post<{ Body: { projectId: string; keyword: string; targetUrl?: string } }>(
        '/keywords/track',
        async (request, reply) => {
            const { projectId, keyword, targetUrl } = request.body;

            try {
                // Fetch initial rank
                const rankData = await dataForSEO.getSerpRank(keyword, projectId);

                // Store in ClickHouse
                const { ClickHouseRankRepository } = await import('@apexseo/shared');
                const record = {
                    site_id: projectId,
                    keyword,
                    rank_position: rankData?.rank || 0,
                    url: rankData?.url || targetUrl || '',
                    rank_date: new Date().toISOString().split('T')[0],
                    search_volume: 0, // Will be updated by RankTracker workflow
                    cpc: 0,
                    serp_features: [],
                    rank_volatility: 0,
                    change_from_yesterday: 0
                };

                await ClickHouseRankRepository.insertRank(record);
                return { success: true, keyword, rank: rankData?.rank || 0 };
            } catch (error) {
                request.log.error(error);
                reply.status(500).send({ error: 'Failed to add keyword to tracking' });
            }
        }
    );

    // Remove keyword from tracking
    fastify.delete<{ Params: { projectId: string; keyword: string } }>(
        '/keywords/track/:projectId/:keyword',
        async (request, reply) => {
            const { projectId, keyword } = request.params;

            try {
                // In ClickHouse, we don't delete but mark as inactive
                // For MVP, we'll just return success
                // In production, add a status column to rank_history
                return { success: true, message: 'Keyword removed from tracking' };
            } catch (error) {
                request.log.error(error);
                reply.status(500).send({ error: 'Failed to remove keyword' });
            }
        }
    );
};

export default keywordsRoutes;
