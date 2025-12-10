import { FastifyReply, FastifyRequest } from 'fastify';
import { MetricCollector } from '../services/MetricCollector';
import { SlackAlert } from '../services/SlackAlert';
import fp from 'fastify-plugin';

export default fp(async (fastify) => {
    fastify.addHook('onResponse', async (request: FastifyRequest, reply: FastifyReply) => {
        const duration = reply.elapsedTime;
        const { method, url } = request;
        const statusCode = reply.statusCode;

        // Skip metrics for health check and static assets if any
        if (url.includes('/health')) return;

        await MetricCollector.recordRequest(method, url, duration, statusCode);

        // Alert on 5xx errors (Simple immediate alert for now, refined thresholding can be done in a worker)
        // For MVP, if it's 500, we alert. 
        // Real-world: Use error budget or threshold.
        if (statusCode >= 500) {
            await SlackAlert.send(`User impacting error on ${method} ${url} - Status ${statusCode}`);
        }
    });
});
