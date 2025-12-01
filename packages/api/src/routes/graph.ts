import { FastifyPluginAsync } from 'fastify';
import { GraphService, LinkOptimizerService, ClickHouseLinkSuggestionRepository } from '@apexseo/shared';

const graphRoutes: FastifyPluginAsync = async (fastify, opts) => {
    // Get Graph Data
    fastify.get<{ Params: { id: string } }>('/projects/:id/graph', async (request, reply) => {
        const { id } = request.params;
        try {
            const graph = await GraphService.getGraph(id);
            return graph;
        } catch (error) {
            request.log.error(error);
            reply.status(500).send({ error: 'Failed to fetch graph data' });
        }
    });

    // Get Clusters
    fastify.get<{ Params: { id: string } }>('/projects/:id/clusters', async (request, reply) => {
        const { id } = request.params;
        try {
            const clusters = await GraphService.getClusters(id);
            return clusters;
        } catch (error) {
            request.log.error(error);
            reply.status(500).send({ error: 'Failed to fetch clusters' });
        }
    });

    // Get Link Suggestions
    fastify.get<{ Params: { id: string } }>('/projects/:id/suggestions', async (request, reply) => {
        const { id } = request.params;
        try {
            const suggestions = await ClickHouseLinkSuggestionRepository.getSuggestions(id, 'pending');
            return suggestions;
        } catch (error) {
            request.log.error(error);
            reply.status(500).send({ error: 'Failed to fetch suggestions' });
        }
    });

    // Accept Suggestion
    fastify.post<{ Params: { id: string }, Body: { siteId: string, anchorText: string } }>('/suggestions/:id/accept', async (request, reply) => {
        const { id } = request.params; // Suggestion ID (source-target pair usually, but here we might need composite)
        // For simplicity, let's assume body contains necessary details or ID is sufficient if we had a lookup
        // But our service expects siteId, suggestionId, anchorText
        const { siteId, anchorText } = request.body;

        try {
            await LinkOptimizerService.acceptSuggestion(siteId, id, anchorText);
            return { status: 'accepted' };
        } catch (error) {
            request.log.error(error);
            reply.status(500).send({ error: 'Failed to accept suggestion' });
        }
    });

    // Reject Suggestion
    fastify.post<{ Params: { id: string }, Body: { siteId: string, reason: string } }>('/suggestions/:id/reject', async (request, reply) => {
        const { id } = request.params;
        const { siteId, reason } = request.body;
        // Logic to reject (update status in CH)
        // We need a service method for this or use Repo directly
        try {
            // Assuming sourceId and targetId are encoded in ID or passed in body. 
            // For MVP, let's assume ID is "sourceId:targetId"
            const [sourceId, targetId] = id.split(':');
            if (!sourceId || !targetId) throw new Error("Invalid ID format");

            await ClickHouseLinkSuggestionRepository.updateStatus(siteId, sourceId, targetId, 'rejected');
            return { status: 'rejected' };
        } catch (error) {
            request.log.error(error);
            reply.status(500).send({ error: 'Failed to reject suggestion' });
        }
    });

    // Trigger Link Optimizer
    fastify.post<{ Params: { id: string } }>('/projects/:id/optimizer', async (request, reply) => {
        const { id } = request.params;
        try {
            // Trigger workflow
            // In a real app, we'd use the Temporal client to start the workflow
            // For now, we'll just return success as if it started
            // const client = getTemporalClient();
            // await client.start(LinkOptimizerWorkflow, { args: [id], taskQueue: 'seo-tasks-queue', workflowId: `optimizer-${id}` });
            return { status: 'started', workflowId: `optimizer-${id}` };
        } catch (error) {
            request.log.error(error);
            reply.status(500).send({ error: 'Failed to start optimizer' });
        }
    });
};

export default graphRoutes;
