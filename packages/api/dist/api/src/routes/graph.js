"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shared_1 = require("@apexseo/shared");
const graphRoutes = async (fastify, opts) => {
    // Get Graph Data
    fastify.get('/projects/:id/graph', async (request, reply) => {
        const { id } = request.params;
        try {
            const graph = await shared_1.GraphService.getGraph(id);
            return graph;
        }
        catch (error) {
            request.log.error(error);
            reply.status(500).send({ error: 'Failed to fetch graph data' });
        }
    });
    // Get Clusters
    fastify.get('/projects/:id/clusters', async (request, reply) => {
        const { id } = request.params;
        try {
            const clusters = await shared_1.GraphService.getClusters(id);
            return clusters;
        }
        catch (error) {
            request.log.error(error);
            reply.status(500).send({ error: 'Failed to fetch clusters' });
        }
    });
    // Get Link Suggestions
    fastify.get('/projects/:id/suggestions', async (request, reply) => {
        const { id } = request.params;
        try {
            const suggestions = await shared_1.ClickHouseLinkSuggestionRepository.getSuggestions(id, 'pending');
            return suggestions;
        }
        catch (error) {
            request.log.error(error);
            reply.status(500).send({ error: 'Failed to fetch suggestions' });
        }
    });
    // Accept Suggestion
    fastify.post('/suggestions/:id/accept', async (request, reply) => {
        const { id } = request.params; // Suggestion ID (source-target pair usually, but here we might need composite)
        // For simplicity, let's assume body contains necessary details or ID is sufficient if we had a lookup
        // But our service expects siteId, suggestionId, anchorText
        const { siteId, anchorText } = request.body;
        try {
            await shared_1.LinkOptimizerService.acceptSuggestion(siteId, id, anchorText);
            return { status: 'accepted' };
        }
        catch (error) {
            request.log.error(error);
            reply.status(500).send({ error: 'Failed to accept suggestion' });
        }
    });
    // Reject Suggestion
    fastify.post('/suggestions/:id/reject', async (request, reply) => {
        const { id } = request.params;
        const { siteId, reason } = request.body;
        // Logic to reject (update status in CH)
        // We need a service method for this or use Repo directly
        try {
            // Assuming sourceId and targetId are encoded in ID or passed in body. 
            // For MVP, let's assume ID is "sourceId:targetId"
            const [sourceId, targetId] = id.split(':');
            if (!sourceId || !targetId)
                throw new Error("Invalid ID format");
            await shared_1.ClickHouseLinkSuggestionRepository.updateStatus(siteId, sourceId, targetId, 'rejected');
            return { status: 'rejected' };
        }
        catch (error) {
            request.log.error(error);
            reply.status(500).send({ error: 'Failed to reject suggestion' });
        }
    });
    // Trigger Link Optimizer
    fastify.post('/projects/:id/optimizer', async (request, reply) => {
        const { id } = request.params;
        try {
            // Trigger workflow
            // In a real app, we'd use the Temporal client to start the workflow
            // For now, we'll just return success as if it started
            // const client = getTemporalClient();
            // await client.start(LinkOptimizerWorkflow, { args: [id], taskQueue: 'seo-tasks-queue', workflowId: `optimizer-${id}` });
            return { status: 'started', workflowId: `optimizer-${id}` };
        }
        catch (error) {
            request.log.error(error);
            reply.status(500).send({ error: 'Failed to start optimizer' });
        }
    });
};
exports.default = graphRoutes;
