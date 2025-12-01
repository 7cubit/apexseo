import { FastifyPluginAsync } from 'fastify';
import { ContentOptimizerService } from '@apexseo/shared';

const contentRoutes: FastifyPluginAsync = async (fastify, opts) => {
    // Score content in real-time
    fastify.post<{ Body: { content: string; targetKeyword: string; siteId: string } }>(
        '/content/score',
        async (request, reply) => {
            const { content, targetKeyword, siteId } = request.body;

            try {
                const score = await ContentOptimizerService.scoreContent(content, targetKeyword, siteId);
                return { score };
            } catch (error) {
                request.log.error(error);
                reply.status(500).send({ error: 'Failed to score content' });
            }
        }
    );

    // Get SERP recommendations
    fastify.get<{ Querystring: { keyword: string; siteId: string } }>(
        '/content/serp-recommendations',
        async (request, reply) => {
            const { keyword, siteId } = request.query;

            try {
                const recommendations = await ContentOptimizerService.getSerpRecommendations(keyword, siteId);
                return { recommendations };
            } catch (error) {
                request.log.error(error);
                reply.status(500).send({ error: 'Failed to fetch SERP recommendations' });
            }
        }
    );
};

export default contentRoutes;
