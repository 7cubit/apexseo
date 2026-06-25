"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const client_1 = require("@temporalio/client");
async function default_1(fastify) {
    fastify.post('/crawl', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const { siteId, startUrl, depth, limit } = request.body;
        const connection = await client_1.Connection.connect({ address: process.env.TEMPORAL_ADDRESS || 'localhost:7233' });
        const client = new client_1.Client({ connection });
        const handle = await client.workflow.start('SiteCrawlWorkflow', {
            taskQueue: 'seo-tasks-queue',
            workflowId: `crawl-${siteId}-${Date.now()}`,
            args: [{ siteId, startUrl, maxDepth: depth, limit }],
        });
        return { workflowId: handle.workflowId, status: 'started' };
    });
    fastify.post('/analyze', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const { projectId } = request.body;
        const connection = await client_1.Connection.connect({ address: process.env.TEMPORAL_ADDRESS || 'localhost:7233' });
        const client = new client_1.Client({ connection });
        const handle = await client.workflow.start('AnalysisWorkflow', {
            taskQueue: 'seo-tasks-queue',
            workflowId: `analysis-${projectId}-${Date.now()}`,
            args: [projectId],
        });
        return { workflowId: handle.workflowId, status: 'started' };
    });
}
