"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shared_1 = require("@apexseo/shared");
const crypto_1 = require("crypto");
const projectsRoutes = async (fastify, opts) => {
    // Get all projects for the authenticated user
    fastify.get('/', async (request, reply) => {
        var _a;
        try {
            // TODO: Get user ID from JWT after NextAuth integration
            const userId = ((_a = request.user) === null || _a === void 0 ? void 0 : _a.id) || 'default-user';
            const projects = await shared_1.ClickHouseProjectRepository.getByUser(userId);
            return { projects };
        }
        catch (error) {
            request.log.error(error);
            reply.status(500).send({ error: 'Failed to fetch projects' });
        }
    });
    // Get a single project by ID
    fastify.get('/:id', async (request, reply) => {
        const { id } = request.params;
        try {
            const project = await shared_1.ClickHouseProjectRepository.getById(id);
            if (!project) {
                return reply.status(404).send({ error: 'Project not found' });
            }
            return { project };
        }
        catch (error) {
            request.log.error(error);
            reply.status(500).send({ error: 'Failed to fetch project' });
        }
    });
    // Create a new project
    fastify.post('/', async (request, reply) => {
        var _a;
        const { name, domain } = request.body;
        if (!name || !domain) {
            return reply.status(400).send({ error: 'Name and domain are required' });
        }
        try {
            // TODO: Get user ID from JWT after NextAuth integration
            const userId = ((_a = request.user) === null || _a === void 0 ? void 0 : _a.id) || 'default-user';
            const project = {
                id: (0, crypto_1.randomUUID)(),
                name,
                domain,
                user_id: userId,
                created_at: new Date().toISOString(),
                site_doctor_enabled: true,
                site_doctor_cron: '0 2 * * *',
                rank_tracker_enabled: true,
                rank_tracker_cron: '0 */6 * * *'
            };
            await shared_1.ClickHouseProjectRepository.create(project);
            return { project };
        }
        catch (error) {
            request.log.error(error);
            reply.status(500).send({ error: 'Failed to create project' });
        }
    });
    // Update a project
    fastify.put('/:id', async (request, reply) => {
        const { id } = request.params;
        const updates = request.body;
        try {
            const existing = await shared_1.ClickHouseProjectRepository.getById(id);
            if (!existing) {
                return reply.status(404).send({ error: 'Project not found' });
            }
            await shared_1.ClickHouseProjectRepository.update(id, updates);
            const updated = await shared_1.ClickHouseProjectRepository.getById(id);
            return { project: updated };
        }
        catch (error) {
            request.log.error(error);
            reply.status(500).send({ error: 'Failed to update project' });
        }
    });
    // Delete a project
    fastify.delete('/:id', async (request, reply) => {
        const { id } = request.params;
        try {
            await shared_1.ClickHouseProjectRepository.delete(id);
            return { success: true };
        }
        catch (error) {
            request.log.error(error);
            reply.status(500).send({ error: 'Failed to delete project' });
        }
    });
    // Trigger crawl for a project
    fastify.post('/:id/crawl', async (request, reply) => {
        const { id } = request.params;
        const { startUrl, maxDepth = 2 } = request.body;
        try {
            const project = await shared_1.ClickHouseProjectRepository.getById(id);
            if (!project) {
                return reply.status(404).send({ error: 'Project not found' });
            }
            // TODO: Trigger Temporal workflow
            // const { Connection, Client } = await import('@temporalio/client');
            // const client = new Client();
            // await client.workflow.start('SiteCrawlWorkflow', {
            //     args: [{ siteId: project.domain, startUrl, maxDepth }],
            //     taskQueue: 'default',
            //     workflowId: `crawl-${project.id}-${Date.now()}`
            // });
            return {
                success: true,
                message: 'Crawl started',
                workflowId: `crawl-${project.id}-${Date.now()}`
            };
        }
        catch (error) {
            request.log.error(error);
            reply.status(500).send({ error: 'Failed to start crawl' });
        }
    });
};
exports.default = projectsRoutes;
