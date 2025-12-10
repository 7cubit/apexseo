import { FastifyInstance } from 'fastify';
import { apiKeyAuth } from '../middleware/apiKeyAuth';
import { htmlProcessingQueue } from '../lib/queue';

export default async function ingestRoutes(fastify: FastifyInstance) {
    fastify.post('/ingest', { preHandler: apiKeyAuth }, async (request, reply) => {
        const body = request.body as { url: string; html: string };

        if (!body.url || !body.html) {
            return reply.code(400).send({ error: 'Missing url or html in payload' });
        }

        try {
            await htmlProcessingQueue.add('process-html', {
                url: body.url,
                html: body.html,
                timestamp: new Date().toISOString()
            });

            return reply.code(202).send({ success: true, message: 'Ingestion queued' });
        } catch (error) {
            request.log.error(error);
            return reply.code(500).send({ error: 'Failed to queue ingestion' });
        }
    });
}
