"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
async function default_1(fastify) {
    fastify.get('/:projectId/sites', { preHandler: [fastify.authenticate, fastify.tenancy] }, async (request, reply) => {
        const { projectId } = request.params;
        // Mock: Get sites for project
        return [{ id: 'site_1', url: 'https://example.com', projectId }];
    });
}
