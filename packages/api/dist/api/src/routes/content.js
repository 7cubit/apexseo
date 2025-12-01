"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shared_1 = require("@apexseo/shared");
const contentRoutes = async (fastify, opts) => {
    // Score content in real-time
    fastify.post('/content/score', async (request, reply) => {
        const { content, targetKeyword, siteId } = request.body;
        try {
            const score = await shared_1.ContentOptimizerService.scoreContent(content, targetKeyword, siteId);
            return { score };
        }
        catch (error) {
            request.log.error(error);
            reply.status(500).send({ error: 'Failed to score content' });
        }
    });
    // Get SERP recommendations
    fastify.get('/content/serp-recommendations', async (request, reply) => {
        const { keyword, siteId } = request.query;
        try {
            const recommendations = await shared_1.ContentOptimizerService.getSerpRecommendations(keyword, siteId);
            return { recommendations };
        }
        catch (error) {
            request.log.error(error);
            reply.status(500).send({ error: 'Failed to fetch SERP recommendations' });
        }
    });
};
exports.default = contentRoutes;
