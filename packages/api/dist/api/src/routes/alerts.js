"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shared_1 = require("@apexseo/shared");
const alertRoutes = async (fastify, opts) => {
    // GET /alerts
    fastify.get('/', async (request, reply) => {
        const { siteId, limit = 50 } = request.query;
        // Mock siteId if not provided (for MVP)
        const effectiveSiteId = siteId || 'example.com';
        try {
            const alerts = await shared_1.AlertService.getAlerts(effectiveSiteId, limit);
            return alerts;
        }
        catch (error) {
            request.log.error(error);
            reply.status(500).send({ error: 'Failed to fetch alerts' });
        }
    });
    // POST /alerts/:id/read
    fastify.post('/:id/read', async (request, reply) => {
        const { id } = request.params;
        const { siteId } = request.body;
        if (!siteId) {
            reply.status(400).send({ error: 'siteId is required' });
            return;
        }
        try {
            await shared_1.AlertService.markAsReadWithSiteId(siteId, id);
            return { success: true };
        }
        catch (error) {
            request.log.error(error);
            reply.status(500).send({ error: 'Failed to mark alert as read' });
        }
    });
};
exports.default = alertRoutes;
