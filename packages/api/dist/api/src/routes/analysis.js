"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
// import { Client, Connection } from '@temporalio/client';
const shared_1 = require("@apexseo/shared");
async function default_1(fastify) {
    fastify.post('/crawl', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const { siteId, startUrl, depth, limit } = request.body;
        // constant connection = await Connection.connect({ address: process.env.TEMPORAL_ADDRESS || 'localhost:7233' });
        // const client = new Client({ connection });
        const client = await (0, shared_1.createTemporalClient)();
        if (!client) {
            return reply.status(503).send({ error: "Temporal service unavailable" });
        }
        const handle = await client.workflow.start('SiteCrawlWorkflow', {
            taskQueue: 'seo-tasks-queue',
            workflowId: `crawl-${siteId}-${Date.now()}`,
            args: [{ siteId, startUrl, maxDepth: depth, limit }],
        });
        return { workflowId: handle.workflowId, status: 'started' };
    });
    fastify.post('/analyze', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const { projectId } = request.body;
        // const connection = await Connection.connect({ address: process.env.TEMPORAL_ADDRESS || 'localhost:7233' });
        // const client = new Client({ connection });
        const client = await (0, shared_1.createTemporalClient)();
        if (!client) {
            return reply.status(503).send({ error: "Temporal service unavailable" });
        }
        const handle = await client.workflow.start('AnalysisWorkflow', {
            taskQueue: 'seo-tasks-queue',
            workflowId: `analysis-${projectId}-${Date.now()}`,
            args: [projectId],
        });
        return { workflowId: handle.workflowId, status: 'started' };
    });
    fastify.post('/analyze/cannibalization', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const { siteId } = request.body;
        if (!siteId) {
            reply.status(400).send({ error: 'siteId is required' });
            return;
        }
        // const connection = await Connection.connect({ address: process.env.TEMPORAL_ADDRESS || 'localhost:7233' });
        // const client = new Client({ connection });
        const client = await (0, shared_1.createTemporalClient)();
        if (!client) {
            return reply.status(503).send({ error: "Temporal service unavailable" });
        }
        const handle = await client.workflow.start('CannibalizationWorkflow', {
            taskQueue: 'seo-compute-queue',
            workflowId: `cannibalization-${siteId}-${Date.now()}`,
            args: [{ siteId }],
        });
        return { workflowId: handle.workflowId, status: 'started' };
    });
}
