import { FastifyReply, FastifyRequest } from 'fastify';

export async function apiKeyAuth(request: FastifyRequest, reply: FastifyReply) {
    const apiKey = request.headers['x-api-key'];
    const apiSecret = process.env.API_SECRET;

    if (!apiSecret) {
        request.log.error('API_SECRET is not defined in environment variables');
        reply.code(500).send({ error: 'Internal Server Error' });
        return;
    }

    if (!apiKey || apiKey !== apiSecret) {
        reply.code(401).send({ error: 'Unauthorized' });
        return;
    }
}
