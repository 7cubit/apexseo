import fp from 'fastify-plugin';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

export default fp(async (fastify: FastifyInstance) => {
    fastify.decorate("tenancy", async function (request: FastifyRequest, reply: FastifyReply) {
        const { user } = request as any;
        const projectId = (request.params as any).id || (request.query as any).projectId;

        if (!user) {
            reply.status(401).send({ error: "Unauthorized" });
            return;
        }

        // Mock tenancy check: Ensure user belongs to the org that owns the project
        // In real app, fetch project from DB and check orgId
        // For MVP, we'll assume if they have a token, they are good, but we attach projectId to request
        request.log.info(`User ${user.id} accessing project ${projectId}`);
    });
});

declare module 'fastify' {
    export interface FastifyInstance {
        tenancy: any;
    }
}
