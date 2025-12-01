import { FastifyPluginAsync } from 'fastify';
import { ClickHouseProjectRepository, Project } from '@apexseo/shared';
import { randomUUID } from 'crypto';

const projectsRoutes: FastifyPluginAsync = async (fastify, opts) => {
    // Get all projects for the authenticated user
    fastify.get('/', async (request, reply) => {
        try {
            // TODO: Get user ID from JWT after NextAuth integration
            const userId = (request as any).user?.id || 'default-user';
            const projects = await ClickHouseProjectRepository.getByUser(userId);
            return { projects };
        } catch (error) {
            request.log.error(error);
            reply.status(500).send({ error: 'Failed to fetch projects' });
        }
    });

    // Get a single project by ID
    fastify.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
        const { id } = request.params;

        try {
            const project = await ClickHouseProjectRepository.getById(id);
            if (!project) {
                return reply.status(404).send({ error: 'Project not found' });
            }
            return { project };
        } catch (error) {
            request.log.error(error);
            reply.status(500).send({ error: 'Failed to fetch project' });
        }
    });

    // Create a new project
    fastify.post<{ Body: { name: string; domain: string } }>('/', async (request, reply) => {
        const { name, domain } = request.body;

        if (!name || !domain) {
            return reply.status(400).send({ error: 'Name and domain are required' });
        }

        try {
            // TODO: Get user ID from JWT after NextAuth integration
            const userId = (request as any).user?.id || 'default-user';

            const project: Project = {
                id: randomUUID(),
                name,
                domain,
                user_id: userId,
                created_at: new Date().toISOString(),
                site_doctor_enabled: true,
                site_doctor_cron: '0 2 * * *',
                rank_tracker_enabled: true,
                rank_tracker_cron: '0 */6 * * *'
            };

            await ClickHouseProjectRepository.create(project);
            return { project };
        } catch (error) {
            request.log.error(error);
            reply.status(500).send({ error: 'Failed to create project' });
        }
    });

    // Update a project
    fastify.put<{ Params: { id: string }; Body: Partial<Project> }>('/:id', async (request, reply) => {
        const { id } = request.params;
        const updates = request.body;

        try {
            const existing = await ClickHouseProjectRepository.getById(id);
            if (!existing) {
                return reply.status(404).send({ error: 'Project not found' });
            }

            await ClickHouseProjectRepository.update(id, updates);
            const updated = await ClickHouseProjectRepository.getById(id);
            return { project: updated };
        } catch (error) {
            request.log.error(error);
            reply.status(500).send({ error: 'Failed to update project' });
        }
    });

    // Delete a project
    fastify.delete<{ Params: { id: string } }>('/:id', async (request, reply) => {
        const { id } = request.params;

        try {
            await ClickHouseProjectRepository.delete(id);
            return { success: true };
        } catch (error) {
            request.log.error(error);
            reply.status(500).send({ error: 'Failed to delete project' });
        }
    });

    // Trigger crawl for a project
    fastify.post<{ Params: { id: string }; Body: { startUrl: string; maxDepth?: number } }>(
        '/:id/crawl',
        async (request, reply) => {
            const { id } = request.params;
            const { startUrl, maxDepth = 2 } = request.body;

            try {
                const project = await ClickHouseProjectRepository.getById(id);
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
            } catch (error) {
                request.log.error(error);
                reply.status(500).send({ error: 'Failed to start crawl' });
            }
        }
    );
};

export default projectsRoutes;
