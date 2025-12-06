"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const agentsRoutes = async (fastify, opts) => {
    // GET /agents/status
    fastify.get('/status', async (request, reply) => {
        // Mock status data
        // In real app, query Temporal or a 'job_history' table
        return {
            siteDoctor: {
                lastRun: new Date(Date.now() - 3600000 * 4).toISOString(), // 4 hours ago
                status: 'healthy',
                nextRun: new Date(Date.now() + 3600000 * 20).toISOString() // in 20 hours
            },
            rankTracker: {
                lastRun: new Date(Date.now() - 3600000 * 12).toISOString(), // 12 hours ago
                status: 'healthy',
                nextRun: new Date(Date.now() + 3600000 * 12).toISOString()
            },
            cannibalizationDetector: {
                lastRun: new Date(Date.now() - 3600000 * 24).toISOString(),
                status: 'warning', // Example
                message: 'High latency detected'
            }
        };
    });
    // GET /agents/activity
    fastify.get('/activity', async (request, reply) => {
        // Mock activity log
        return [
            { id: '1', job: 'SiteDoctor', status: 'success', duration: '5m 20s', timestamp: new Date(Date.now() - 3600000 * 4).toISOString() },
            { id: '2', job: 'RankTracker', status: 'success', duration: '2m 10s', timestamp: new Date(Date.now() - 3600000 * 12).toISOString() },
            { id: '3', job: 'SiteDoctor', status: 'failed', duration: '1m 0s', timestamp: new Date(Date.now() - 3600000 * 28).toISOString() },
        ];
    });
};
exports.default = agentsRoutes;
