"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shared_1 = require("@apexseo/shared");
const alertRoutes = async (fastify, opts) => {
    // Get alerts for a project
    fastify.get('/projects/:id/alerts', async (request, reply) => {
        const { id } = request.params;
        const { status } = request.query;
        try {
            const alerts = await shared_1.ClickHouseAlertRepository.getAlerts(id, status);
            return { alerts };
        }
        catch (error) {
            request.log.error(error);
            reply.status(500).send({ error: 'Failed to fetch alerts' });
        }
    });
    // Update alert status
    fastify.patch('/projects/:id/alerts/:alertId', async (request, reply) => {
        const { id, alertId } = request.params;
        const { status } = request.body;
        if (!['new', 'acknowledged', 'resolved'].includes(status)) {
            return reply.status(400).send({ error: 'Invalid status' });
        }
        try {
            await shared_1.ClickHouseAlertRepository.updateAlertStatus(id, alertId, status);
            return { success: true, message: `Alert status updated to ${status}` };
        }
        catch (error) {
            request.log.error(error);
            reply.status(500).send({ error: 'Failed to update alert status' });
        }
    });
};
exports.default = alertRoutes;
