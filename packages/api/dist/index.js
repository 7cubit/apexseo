"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const dotenv_1 = __importDefault(require("dotenv"));
const shared_1 = require("@apexseo/shared");
dotenv_1.default.config();
const fastify = (0, fastify_1.default)({
    logger: false // Use our custom logger
});
(0, shared_1.initTelemetry)('api-gateway');
fastify.get('/health', async (request, reply) => {
    shared_1.logger.info('Health check requested');
    return { status: 'ok', timestamp: new Date().toISOString() };
});
const client_1 = require("@temporalio/client");
// ...
// Crawl endpoints
fastify.post('/crawl', async (request, reply) => {
    const { siteId, startUrl, depth, limit } = request.body; // Define a schema for better typing
    try {
        const connection = await client_1.Connection.connect({
            address: process.env.TEMPORAL_ADDRESS || 'localhost:7233',
        });
        const client = new client_1.Client({
            connection,
        });
        const handle = await client.workflow.start('SiteCrawlWorkflow', {
            taskQueue: 'seo-tasks-queue',
            workflowId: `crawl-${siteId}-${Date.now()}`,
            args: [{ siteId, startUrl, maxDepth: depth, limit }],
        });
        return { workflowId: handle.workflowId, status: 'started' };
    }
    catch (err) {
        shared_1.logger.error('Failed to start crawl', { error: err });
        reply.code(500).send({ error: 'Failed to start crawl' });
    }
});
fastify.get('/crawl/:id', async (request, reply) => {
    const { id } = request.params;
    // Get workflow status
    return { workflowId: id, status: 'running' };
});
const start = async () => {
    try {
        await fastify.listen({ port: 4000, host: '0.0.0.0' });
        shared_1.logger.info('API Gateway listening on port 4000');
    }
    catch (err) {
        shared_1.logger.error('Failed to start API Gateway', { error: err });
        process.exit(1);
    }
};
start();
