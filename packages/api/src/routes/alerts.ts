import { FastifyPluginAsync } from 'fastify';
import { ClickHouseAlertRepository } from '@apexseo/shared';

const alertRoutes: FastifyPluginAsync = async (fastify, opts) => {
    // Get alerts for a project
    fastify.get<{ Params: { id: string }, Querystring: { status?: string } }>('/projects/:id/alerts', async (request, reply) => {
        const { id } = request.params;
        const { status } = request.query;
        try {
            const alerts = await ClickHouseAlertRepository.getAlerts(id, status);
            return { alerts };
        } catch (error) {
            request.log.error(error);
            reply.status(500).send({ error: 'Failed to fetch alerts' });
        }
    });

    // Update alert status
    fastify.patch<{ Params: { id: string, alertId: string }, Body: { status: string } }>(
        '/projects/:id/alerts/:alertId',
        async (request, reply) => {
            const { id, alertId } = request.params;
            const { status } = request.body;

            if (!['new', 'acknowledged', 'resolved'].includes(status)) {
                return reply.status(400).send({ error: 'Invalid status' });
            }

            try {
                await ClickHouseAlertRepository.updateAlertStatus(id, alertId, status);
                return { success: true, message: `Alert status updated to ${status}` };
            } catch (error) {
                request.log.error(error);
                reply.status(500).send({ error: 'Failed to update alert status' });
            }
        }
    );
};

export default alertRoutes;
