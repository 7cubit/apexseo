import { FastifyPluginAsync } from 'fastify';
import { AlertService } from '@apexseo/shared';

const alertRoutes: FastifyPluginAsync = async (fastify, opts) => {
    // GET /alerts
    fastify.get<{ Querystring: { siteId: string; limit?: number } }>('/', async (request, reply) => {
        const { siteId, limit = 50 } = request.query;
        // Mock siteId if not provided (for MVP)
        const effectiveSiteId = siteId || 'example.com';

        try {
            const alerts = await AlertService.getAlerts(effectiveSiteId, limit);
            return alerts;
        } catch (error) {
            request.log.error(error);
            reply.status(500).send({ error: 'Failed to fetch alerts' });
        }
    });

    // POST /alerts/:id/read
    fastify.post<{ Params: { id: string }; Body: { siteId: string } }>('/:id/read', async (request, reply) => {
        const { id } = request.params;
        const { siteId } = request.body;

        if (!siteId) {
            reply.status(400).send({ error: 'siteId is required' });
            return;
        }

        try {
            await AlertService.markAsReadWithSiteId(siteId, id);
            return { success: true };
        } catch (error) {
            request.log.error(error);
            reply.status(500).send({ error: 'Failed to mark alert as read' });
        }
    });
};

export default alertRoutes;
