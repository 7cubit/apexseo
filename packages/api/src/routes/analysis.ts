import { FastifyInstance } from 'fastify';
// import { Client, Connection } from '@temporalio/client';
import { createTemporalClient } from '@apexseo/shared';

export default async function (fastify: FastifyInstance) {
    fastify.post('/crawl', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const { siteId, startUrl, depth, limit } = request.body as any;

        // constant connection = await Connection.connect({ address: process.env.TEMPORAL_ADDRESS || 'localhost:7233' });
        // const client = new Client({ connection });
        const client = await createTemporalClient();
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
        const { projectId } = request.body as any;

        // const connection = await Connection.connect({ address: process.env.TEMPORAL_ADDRESS || 'localhost:7233' });
        // const client = new Client({ connection });
        const client = await createTemporalClient();
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
        const { siteId } = request.body as { siteId: string };

        if (!siteId) {
            reply.status(400).send({ error: 'siteId is required' });
            return;
        }

        // const connection = await Connection.connect({ address: process.env.TEMPORAL_ADDRESS || 'localhost:7233' });
        // const client = new Client({ connection });
        const client = await createTemporalClient();
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
