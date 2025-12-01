"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = agentsRoutes;
const shared_1 = require("@apexseo/shared");
async function agentsRoutes(fastify) {
    fastify.get('/status', async (request, reply) => {
        // Mock status for now, or query Temporal if client available
        // Ideally we query Temporal for schedule status
        return {
            agents: [
                { name: 'SiteDoctor', status: 'idle', lastRun: new Date(Date.now() - 86400000).toISOString(), nextRun: new Date(Date.now() + 3600000).toISOString() },
                { name: 'RankTracker', status: 'running', lastRun: new Date().toISOString(), nextRun: new Date(Date.now() + 86400000).toISOString() },
                { name: 'ScoreRefresh', status: 'idle', lastRun: new Date(Date.now() - 43200000).toISOString(), nextRun: new Date(Date.now() + 43200000).toISOString() },
            ],
            system: 'healthy'
        };
    });
    fastify.get('/alerts', async (request, reply) => {
        const { siteId } = request.query;
        if (!siteId) {
            return reply.status(400).send({ error: 'siteId is required' });
        }
        const alerts = await shared_1.ClickHouseAlertRepository.getAlerts(siteId);
        return { alerts };
    });
    fastify.post('/trigger', async (request, reply) => {
        const { workflow, siteId } = request.body;
        // Mock trigger
        console.log(`Triggering ${workflow} for ${siteId}`);
        return { success: true, message: `Triggered ${workflow}` };
    });
}
