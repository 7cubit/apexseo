import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { LinkOptimizerService, ClickHouseLinkSuggestionRepository } from '@apexseo/shared';

const suggestionsRoutes: FastifyPluginAsync = async (fastify, opts) => {
    // Get suggestions for a project
    fastify.get<{ Params: { id: string } }>('/projects/:id/suggestions', async (request, reply) => {
        const { id } = request.params;
        // In a real app, resolve project ID to site ID/domain
        // For MVP, we assume they are the same or handled by the service
        const siteId = 'example.com'; // Placeholder, should be looked up from project

        try {
            const suggestions = await ClickHouseLinkSuggestionRepository.getSuggestions(siteId, 'pending');
            return suggestions;
        } catch (error) {
            request.log.error(error);
            reply.status(500).send({ error: 'Failed to fetch suggestions' });
        }
    });

    // Accept a suggestion
    fastify.post('/suggestions/:suggestionId/accept', async (request: FastifyRequest<{ Params: { suggestionId: string }; Body: { siteId: string; anchorText: string } }>, reply) => {
        const { suggestionId } = request.params;
        const { siteId, anchorText } = request.body;

        // Use 'example.com' if siteId is the project UUID (temporary hack for MVP)
        const effectiveSiteId = siteId.includes('-') ? 'example.com' : siteId;

        try {
            await LinkOptimizerService.acceptSuggestion(effectiveSiteId, suggestionId, anchorText);
            return { success: true };
        } catch (error) {
            request.log.error(error);
            reply.status(500).send({ error: 'Failed to accept suggestion' });
        }
    });

    // Reject a suggestion
    fastify.post('/suggestions/:suggestionId/reject', async (request: FastifyRequest<{ Params: { suggestionId: string }; Body: { siteId: string; reason: string } }>, reply) => {
        const { suggestionId } = request.params;
        const { siteId, reason } = request.body;

        const effectiveSiteId = siteId.includes('-') ? 'example.com' : siteId;

        try {
            await LinkOptimizerService.rejectSuggestion(effectiveSiteId, suggestionId, reason);
            return { success: true };
        } catch (error) {
            request.log.error(error);
            reply.status(500).send({ error: 'Failed to reject suggestion' });
        }
    });
};

export default suggestionsRoutes;
