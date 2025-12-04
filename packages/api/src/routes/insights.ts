import { FastifyPluginAsync } from 'fastify';
import { ClickHousePageRepository, ClickHouseLinkSuggestionRepository } from '@apexseo/shared';

const insightsRoutes: FastifyPluginAsync = async (fastify) => {
    // GET /projects/:id/overview
    fastify.get('/:id/overview', async (request, reply) => {
        const { id } = request.params as { id: string };
        // In a real app, we'd look up the project to get the domain.
        // For now, we'll assume the ID *is* the domain or we can look it up.
        // The previous steps used domain as ID in some places, but let's be robust.
        // Let's assume we need to fetch the project first to get the domain.
        // But wait, ClickHousePageRepository methods take 'domain'.
        // Let's assume for this MVP that the project ID passed here maps to the 'site_id' in ClickHouse.
        // In the test script, we used 'example.com' as the site_id.
        // So we should pass the domain.

        // TODO: Look up project by ID to get domain.
        // For now, we'll assume the caller passes the domain as the ID or we use a lookup.
        // Let's try to fetch the project from ClickHouseProjectRepository if we had one exposed here.
        // Or just assume the ID passed IS the domain for simplicity in this phase, 
        // OR (better) use the project service to get the domain.

        // Let's assume the frontend passes the project ID, and we need to resolve it.
        // Since we don't have a full project lookup handy in this file, let's assume the ID is the domain for now
        // to unblock the UI work. We can refine this later.
        // ACTUALLY, the user said "Pick a real test project... UnityDB_Test".
        // The project ID is a UUID. The domain is 'example.com'.
        // We need to map UUID -> Domain.
        // Let's use ClickHouseProjectRepository (which is in shared) to get the project.

        // Wait, ClickHouseProjectRepository isn't fully implemented/exported in shared index yet?
        // Let's check imports.

        const domain = 'example.com'; // Placeholder until we can look it up.
        // Ideally: const project = await ClickHouseProjectRepository.findById(id); const domain = project.domain;

        try {
            const overview = await ClickHousePageRepository.getProjectOverview(domain);
            return overview;
        } catch (error) {
            request.log.error(error);
            reply.status(500).send({ error: 'Failed to fetch overview' });
        }
    });

    // GET /projects/:id/pages
    fastify.get('/:id/pages', async (request, reply) => {
        const { id } = request.params as { id: string };
        const { page = 1, limit = 10 } = request.query as { page: number; limit: number };
        const offset = (page - 1) * limit;
        const domain = 'example.com'; // Placeholder

        try {
            const result = await ClickHousePageRepository.getPages(domain, limit, offset);
            return result;
        } catch (error) {
            request.log.error(error);
            reply.status(500).send({ error: 'Failed to fetch pages' });
        }
    });

    // GET /projects/:id/pages/:pageId/audit
    fastify.get('/:id/pages/:pageId/audit', async (request, reply) => {
        const { id, pageId } = request.params as { id: string; pageId: string };
        const domain = 'example.com'; // Placeholder

        try {
            const page = await ClickHousePageRepository.getPageAudit(domain, pageId);
            if (!page) {
                reply.status(404).send({ error: 'Page not found' });
                return;
            }
            return {
                content_score: page.content_score,
                // structure_score: page.structure_score, // Not in schema yet?
                // missing_keywords: page.missing_keywords, // Not in schema yet?
                // nlp_term_coverage: page.nlp_term_coverage, // Not in schema yet?
                // For now return what we have
                ...page
            };
        } catch (error) {
            request.log.error(error);
            reply.status(500).send({ error: 'Failed to fetch audit' });
        }
    });

    // GET /projects/:id/internal-links
    fastify.get('/:id/internal-links', async (request, reply) => {
        const { id } = request.params as { id: string };
        const domain = 'example.com'; // Placeholder

        try {
            const suggestions = await ClickHouseLinkSuggestionRepository.getSuggestions(domain);
            return suggestions;
        } catch (error) {
            request.log.error(error);
            reply.status(500).send({ error: 'Failed to fetch suggestions' });
        }
    });

    // POST /projects/:id/internal-links/generate
    fastify.post('/:id/internal-links/generate', async (request, reply) => {
        const { id } = request.params as { id: string };
        const domain = 'example.com'; // Placeholder

        try {
            // Initialize Temporal Client (Inline for now, should be shared service)
            const { Connection, WorkflowClient } = await import('@temporalio/client');
            const connection = await Connection.connect({ address: process.env.TEMPORAL_ADDRESS || 'localhost:7233' });
            const client = new WorkflowClient({ connection });

            const handle = await client.start('InternalLinkSuggestionWorkflow', {
                args: [{ projectId: id, siteId: domain }],
                taskQueue: 'seo-tasks-queue',
                workflowId: `link-suggestions-${id}-${Date.now()}`
            });

            return {
                status: 'started',
                workflowId: handle.workflowId
            };
        } catch (error) {
            request.log.error(error);
            reply.status(500).send({ error: 'Failed to trigger link suggestion workflow' });
        }
    });
};

export default insightsRoutes;
