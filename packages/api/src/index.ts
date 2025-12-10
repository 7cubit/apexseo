import Fastify, { FastifyRequest, FastifyReply } from 'fastify';
import dotenv from 'dotenv';
import { logger, redis } from '@apexseo/shared';
import authPlugin from './plugins/auth';
import tenancyPlugin from './plugins/tenancy';
import siteRoutes from './routes/sites';
import analysisRoutes from './routes/analysis';
import { graphRoutes } from './routes/graph';
import agentsRoutes from './routes/agents';
import scheduleRoutes from './routes/schedules';
import keywordsRoutes from './routes/keywords';
import contentRoutes from './routes/content';
import projectsRoutes from './routes/projects';
import alertRoutes from './routes/alerts';
import adminAuthRoutes from './routes/admin-auth';
import { adminUserRoutes } from './routes/admin-users';
import adminProductRoutes from './routes/admin-products';
// import adminAccountRoutes from './routes/admin-accounts'; // Validated: exists.
import adminAccountRoutes from './routes/admin-accounts';
import adminBillingRoutes from './routes/admin-billing';
import { adminSystemRoutes } from './routes/admin-system';
import suggestionsRoutes from './routes/suggestions';
import ingestRoutes from './routes/ingest';
import { stripeWebhooks } from './routes/stripe-webhooks';
import { campaignRoutes } from './routes/campaigns';
import { trackingRoutes } from './routes/tracking';

import path from 'path';
const envPath = path.resolve(__dirname, '../../../.env');
console.log('Loading .env from:', envPath);
const result = dotenv.config({ path: envPath });
if (result.error) {
    console.error('Error loading .env:', result.error);
} else {
    console.log('.env loaded successfully');
}

const fastify = Fastify({
    logger: false // Use our custom logger
});

// initTelemetry('api-gateway');

// Register Plugins
import rateLimit from '@fastify/rate-limit';
import swaggerPlugin from './plugins/swagger';

import cors from '@fastify/cors';

import cookie from '@fastify/cookie';

fastify.register(cookie, {
    secret: process.env.COOKIE_SECRET || 'supersecret-cookie-secret', // for cookies signature
    hook: 'onRequest', // set to false to disable cookie parsing on request
    parseOptions: {}  // options for parsing cookies
});

fastify.register(cors, {
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true
});

import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import errorHandlerPlugin from './plugins/error-handler';

// ...

fastify.setValidatorCompiler(validatorCompiler);
fastify.setSerializerCompiler(serializerCompiler);

fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    redis: redis // Use shared Redis client
});
fastify.register(errorHandlerPlugin);
fastify.register(swaggerPlugin);
fastify.register(authPlugin);
fastify.register(tenancyPlugin);

// Register Routes
fastify.register(siteRoutes, { prefix: '/sites' });
fastify.register(analysisRoutes, { prefix: '/analysis' });
fastify.register(graphRoutes);
fastify.register(agentsRoutes, { prefix: '/agents' });
fastify.register(scheduleRoutes);
fastify.register(keywordsRoutes);
fastify.register(contentRoutes);
fastify.register(projectsRoutes, { prefix: '/projects' });
fastify.register(suggestionsRoutes);
fastify.register(ingestRoutes);
fastify.register(stripeWebhooks);
fastify.register(alertRoutes, { prefix: '/alerts' });
// Actually, the route file defines /:id/suggestions, so mounting at /projects makes it /projects/:id/suggestions.
// However, the accept/reject routes are /:suggestionId/accept.
// If we mount at /projects, it becomes /projects/:suggestionId/accept which is weird if suggestionId is not a project ID.
// Let's mount it at root or a specific prefix.
// The frontend calls `/api/suggestions/...` for accept/reject.
// So we should mount it at /api (which is default) or just register it.
// But wait, the GET is /projects/:id/suggestions.
// Let's split them or handle the prefix carefully.
// For simplicity, let's register it without a prefix and let the route define the full path, OR register it twice with different prefixes if needed, OR refactor the route file.
// Refactoring the route file is better but I just wrote it.
// The route file has:
// GET /:id/suggestions  -> intended to be /projects/:id/suggestions
// POST /:suggestionId/accept -> intended to be /suggestions/:suggestionId/accept (based on frontend)

// Let's register it at root for now, but that might conflict.
// Actually, let's look at the route file again.
// fastify.get('/:id/suggestions') -> /projects/:id/suggestions if mounted at /projects
// fastify.post('/:suggestionId/accept') -> /projects/:suggestionId/accept -> This is NOT what frontend calls.
// Frontend calls: /api/suggestions/:suggestionId/accept

// I should have split them.
// Let's register it twice? No, that's messy.
// Let's register it at root and change the route definitions in the file?
// I can't change the file in this tool call.
// I will register it at root, but I need to be careful about the paths.
// Wait, I can use `multi_replace` to fix the route file too? No, "TargetFile" is specific.

// Let's register it at root.
// The route file has `/:id/suggestions`. If registered at root, it matches `/123/suggestions`.
// Frontend calls `/projects/:id/suggestions`.
// So I need to change the route file to `/projects/:id/suggestions` and `/suggestions/:suggestionId/accept`.

// OK, I will register it at root here, and then I will do another tool call to fix the route paths in suggestions.ts.
// Registers moved to start() for correct middleware ordering
fastify.register(alertRoutes);
// fastify.register(adminAuthRoutes, { prefix: '/admin/auth' }); // Moving to start()
// fastify.register(adminUserRoutes, { prefix: '/admin/users' }); // Moving to start()
// fastify.register(adminAccountRoutes, { prefix: '/admin/accounts' }); // Moving to start()

// fastify.get('/health'...) replaced by routes/health.ts
fastify.register(healthRoutes);

// import { graphRoutes } from './routes/graph'; // Removed duplicate

// ... existing code ...

import helmet from '@fastify/helmet';
import clerkAuthPlugin from './plugins/clerk-auth';
import { auditLogger } from './middleware/audit-logger';
import metricsMiddleware from './middleware/metrics'; // New middleware
import { healthRoutes } from './routes/health'; // New route

// ...

const start = async () => {
    try {
        await fastify.register(helmet, { global: true });
        await fastify.register(clerkAuthPlugin);
        await fastify.register(metricsMiddleware); // Register early

        // Register Admin Routes (After Auth/Helmet)
        await fastify.register(adminAuthRoutes, { prefix: '/admin/auth' });
        await fastify.register(adminUserRoutes, { prefix: '/admin/users' });
        await fastify.register(adminProductRoutes, { prefix: '/admin/products' });
        await fastify.register(adminBillingRoutes, { prefix: '/admin/billing' });
        await fastify.register(campaignRoutes, { prefix: '/campaigns' });
        await fastify.register(trackingRoutes, { prefix: '/tracking' });
        await fastify.register(adminAccountRoutes, { prefix: '/admin/accounts' });
        await fastify.register(adminSystemRoutes, { prefix: '/admin/system' });


        // Audit Logger as a global hook for relevant methods
        fastify.addHook('onResponse', async (request, reply) => {
            // We can call the audit logger here or as preHandler. 
            // Implementation in audit-logger.ts was async function.
            // Let's call it here to ensure it runs.
            // Actually, audit-logger.ts is written as a handler. let's adapt it.
            // Or just register it as a global hook.
            await auditLogger(request as any, reply as any);
        });

        await fastify.register(graphRoutes, { prefix: '/graph' });
        // ... existing code ...
        await fastify.listen({ port: 4000, host: '0.0.0.0' });
        logger.info('API Gateway listening on port 4000');
    } catch (err) {
        logger.error('Failed to start API Gateway', { error: err });
        process.exit(1);
    }
};

start();
