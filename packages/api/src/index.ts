import Fastify, { FastifyRequest, FastifyReply } from 'fastify';
import dotenv from 'dotenv';
import { logger } from '@apexseo/shared';
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
import adminAccountRoutes from './routes/admin-accounts';

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
    timeWindow: '1 minute'
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
fastify.register(alertRoutes);
fastify.register(adminAuthRoutes, { prefix: '/admin/auth' });
fastify.register(adminUserRoutes, { prefix: '/admin/users' });
fastify.register(adminAccountRoutes, { prefix: '/admin/accounts' });

fastify.get('/health', async (request: FastifyRequest, reply: FastifyReply) => {
    logger.info('Health check requested');
    return { status: 'ok', timestamp: new Date().toISOString() };
});

// import { graphRoutes } from './routes/graph'; // Removed duplicate

// ... existing code ...

const start = async () => {
    try {
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
