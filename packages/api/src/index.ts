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
import adminAccountRoutes from './routes/admin-accounts';
import adminBillingRoutes from './routes/admin-billing';
import { adminSystemRoutes } from './routes/admin-system';
import suggestionsRoutes from './routes/suggestions';
import ingestRoutes from './routes/ingest';
import { stripeWebhooks } from './routes/stripe-webhooks';
import { campaignRoutes } from './routes/campaigns';
import { trackingRoutes } from './routes/tracking';
import { adminSubscriptionRoutes } from './routes/admin-subscriptions';
import { adminAnalyticsRoutes } from './routes/admin-analytics';
import projectUsersRoutes from './routes/project-users';

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
    secret: process.env.COOKIE_SECRET || 'supersecret-cookie-secret',
    hook: 'onRequest',
    parseOptions: {}
});

fastify.register(cors, {
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true
});

import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import errorHandlerPlugin from './plugins/error-handler';

fastify.setValidatorCompiler(validatorCompiler);
fastify.setSerializerCompiler(serializerCompiler);

fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    redis: redis
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
fastify.register(projectUsersRoutes, { prefix: '/projects' });
fastify.register(suggestionsRoutes);
fastify.register(ingestRoutes);
fastify.register(stripeWebhooks);
fastify.register(alertRoutes, { prefix: '/alerts' });
fastify.register(alertRoutes);

// Health check setup
import { healthRoutes } from './routes/health';
fastify.register(healthRoutes);

import helmet from '@fastify/helmet';
import clerkAuthPlugin from './plugins/clerk-auth';
import { auditLogger } from './middleware/audit-logger';
import metricsMiddleware from './middleware/metrics';

const start = async () => {
    try {
        await fastify.register(helmet, { global: true });
        await fastify.register(clerkAuthPlugin);
        await fastify.register(metricsMiddleware);

        // Register Admin Routes (After Auth/Helmet)
        await fastify.register(adminAuthRoutes, { prefix: '/admin/auth' });
        await fastify.register(adminUserRoutes, { prefix: '/admin/users' });
        await fastify.register(adminProductRoutes, { prefix: '/admin/products' });
        await fastify.register(adminBillingRoutes, { prefix: '/admin/billing' });
        await fastify.register(campaignRoutes, { prefix: '/campaigns' });
        await fastify.register(trackingRoutes, { prefix: '/tracking' });
        await fastify.register(adminAccountRoutes, { prefix: '/admin/accounts' });
        await fastify.register(adminSystemRoutes, { prefix: '/admin/system' });
        await fastify.register(adminSubscriptionRoutes, { prefix: '/admin/subscriptions' });
        await fastify.register(adminAnalyticsRoutes, { prefix: '/admin/analytics' });

        fastify.addHook('onResponse', async (request, reply) => {
            await auditLogger(request as any, reply as any);
        });

        await fastify.register(graphRoutes, { prefix: '/graph' });
        await fastify.listen({ port: 4000, host: '0.0.0.0' });
        logger.info('API Gateway listening on port 4000');
    } catch (err) {
        logger.error('Failed to start API Gateway', { error: err });
        process.exit(1);
    }
};

start();
