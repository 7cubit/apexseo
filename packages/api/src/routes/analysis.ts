import { FastifyInstance } from 'fastify';
import { Client, Connection } from '@temporalio/client';

export default async function (fastify: FastifyInstance) {
    fastify.post('/crawl', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const { siteId, startUrl, depth, limit } = request.body as any;

        const connection = await Connection.connect({ address: process.env.TEMPORAL_ADDRESS || 'localhost:7233' });
        const client = new Client({ connection });

        const handle = await client.workflow.start('SiteCrawlWorkflow', {
            taskQueue: 'seo-tasks-queue',
            workflowId: `crawl-${siteId}-${Date.now()}`,
            args: [{ siteId, startUrl, maxDepth: depth, limit }],
        });

        return { workflowId: handle.workflowId, status: 'started' };
    });

    fastify.post('/analyze', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const { projectId } = request.body as any;

        const connection = await Connection.connect({ address: process.env.TEMPORAL_ADDRESS || 'localhost:7233' });
        const client = new Client({ connection });

        const handle = await client.workflow.start('AnalysisWorkflow', {
            taskQueue: 'seo-tasks-queue',
            workflowId: `analysis-${projectId}-${Date.now()}`,
            args: [projectId],
        });

        return { workflowId: handle.workflowId, status: 'started' };
    });
}
