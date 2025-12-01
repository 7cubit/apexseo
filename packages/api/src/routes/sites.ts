import { FastifyInstance } from 'fastify';
import { ClickHousePageRepository } from '@apexseo/shared';

export default async function (fastify: FastifyInstance) {
    fastify.get('/:projectId/sites', { preHandler: [fastify.authenticate, fastify.tenancy] }, async (request, reply) => {
        const { projectId } = request.params as any;
        // Mock: Get sites for project
        return [{ id: 'site_1', url: 'https://example.com', projectId }];
    });
}
