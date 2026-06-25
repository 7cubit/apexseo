"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const dotenv_1 = __importDefault(require("dotenv"));
const shared_1 = require("@apexseo/shared");
const auth_1 = __importDefault(require("./plugins/auth"));
const tenancy_1 = __importDefault(require("./plugins/tenancy"));
const sites_1 = __importDefault(require("./routes/sites"));
const analysis_1 = __importDefault(require("./routes/analysis"));
const graph_1 = require("./routes/graph");
const agents_1 = __importDefault(require("./routes/agents"));
const schedules_1 = __importDefault(require("./routes/schedules"));
const keywords_1 = __importDefault(require("./routes/keywords"));
const content_1 = __importDefault(require("./routes/content"));
const projects_1 = __importDefault(require("./routes/projects"));
const alerts_1 = __importDefault(require("./routes/alerts"));
const admin_auth_1 = __importDefault(require("./routes/admin-auth"));
const admin_users_1 = require("./routes/admin-users");
const admin_products_1 = __importDefault(require("./routes/admin-products"));
// import adminAccountRoutes from './routes/admin-accounts'; // Validated: exists.
const admin_accounts_1 = __importDefault(require("./routes/admin-accounts"));
const admin_billing_1 = __importDefault(require("./routes/admin-billing"));
const admin_system_1 = require("./routes/admin-system");
const suggestions_1 = __importDefault(require("./routes/suggestions"));
const ingest_1 = __importDefault(require("./routes/ingest"));
const stripe_webhooks_1 = require("./routes/stripe-webhooks");
const campaigns_1 = require("./routes/campaigns");
const tracking_1 = require("./routes/tracking");
const path_1 = __importDefault(require("path"));
const envPath = path_1.default.resolve(__dirname, '../../../.env');
console.log('Loading .env from:', envPath);
const result = dotenv_1.default.config({ path: envPath });
if (result.error) {
    console.error('Error loading .env:', result.error);
}
else {
    console.log('.env loaded successfully');
}
const fastify = (0, fastify_1.default)({
    logger: false // Use our custom logger
});
// initTelemetry('api-gateway');
// Register Plugins
const rate_limit_1 = __importDefault(require("@fastify/rate-limit"));
const swagger_1 = __importDefault(require("./plugins/swagger"));
const cors_1 = __importDefault(require("@fastify/cors"));
const cookie_1 = __importDefault(require("@fastify/cookie"));
fastify.register(cookie_1.default, {
    secret: process.env.COOKIE_SECRET || 'supersecret-cookie-secret', // for cookies signature
    hook: 'onRequest', // set to false to disable cookie parsing on request
    parseOptions: {} // options for parsing cookies
});
fastify.register(cors_1.default, {
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true
});
const fastify_type_provider_zod_1 = require("fastify-type-provider-zod");
const error_handler_1 = __importDefault(require("./plugins/error-handler"));
// ...
fastify.setValidatorCompiler(fastify_type_provider_zod_1.validatorCompiler);
fastify.setSerializerCompiler(fastify_type_provider_zod_1.serializerCompiler);
fastify.register(rate_limit_1.default, {
    max: 100,
    timeWindow: '1 minute',
    redis: shared_1.redis // Use shared Redis client
});
fastify.register(error_handler_1.default);
fastify.register(swagger_1.default);
fastify.register(auth_1.default);
fastify.register(tenancy_1.default);
// Register Routes
fastify.register(sites_1.default, { prefix: '/sites' });
fastify.register(analysis_1.default, { prefix: '/analysis' });
fastify.register(graph_1.graphRoutes);
fastify.register(agents_1.default, { prefix: '/agents' });
fastify.register(schedules_1.default);
fastify.register(keywords_1.default);
fastify.register(content_1.default);
fastify.register(projects_1.default, { prefix: '/projects' });
fastify.register(suggestions_1.default);
fastify.register(ingest_1.default);
fastify.register(stripe_webhooks_1.stripeWebhooks);
fastify.register(alerts_1.default, { prefix: '/alerts' });
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
fastify.register(alerts_1.default);
// fastify.register(adminAuthRoutes, { prefix: '/admin/auth' }); // Moving to start()
// fastify.register(adminUserRoutes, { prefix: '/admin/users' }); // Moving to start()
// fastify.register(adminAccountRoutes, { prefix: '/admin/accounts' }); // Moving to start()
// fastify.get('/health'...) replaced by routes/health.ts
fastify.register(health_1.healthRoutes);
// import { graphRoutes } from './routes/graph'; // Removed duplicate
// ... existing code ...
const helmet_1 = __importDefault(require("@fastify/helmet"));
const clerk_auth_1 = __importDefault(require("./plugins/clerk-auth"));
const audit_logger_1 = require("./middleware/audit-logger");
const metrics_1 = __importDefault(require("./middleware/metrics")); // New middleware
const health_1 = require("./routes/health"); // New route
// ...
const start = async () => {
    try {
        await fastify.register(helmet_1.default, { global: true });
        await fastify.register(clerk_auth_1.default);
        await fastify.register(metrics_1.default); // Register early
        // Register Admin Routes (After Auth/Helmet)
        await fastify.register(admin_auth_1.default, { prefix: '/admin/auth' });
        await fastify.register(admin_users_1.adminUserRoutes, { prefix: '/admin/users' });
        await fastify.register(admin_products_1.default, { prefix: '/admin/products' });
        await fastify.register(admin_billing_1.default, { prefix: '/admin/billing' });
        await fastify.register(campaigns_1.campaignRoutes, { prefix: '/campaigns' });
        await fastify.register(tracking_1.trackingRoutes, { prefix: '/tracking' });
        await fastify.register(admin_accounts_1.default, { prefix: '/admin/accounts' });
        await fastify.register(admin_system_1.adminSystemRoutes, { prefix: '/admin/system' });
        // Audit Logger as a global hook for relevant methods
        fastify.addHook('onResponse', async (request, reply) => {
            // We can call the audit logger here or as preHandler. 
            // Implementation in audit-logger.ts was async function.
            // Let's call it here to ensure it runs.
            // Actually, audit-logger.ts is written as a handler. let's adapt it.
            // Or just register it as a global hook.
            await (0, audit_logger_1.auditLogger)(request, reply);
        });
        await fastify.register(graph_1.graphRoutes, { prefix: '/graph' });
        // ... existing code ...
        await fastify.listen({ port: 4000, host: '0.0.0.0' });
        shared_1.logger.info('API Gateway listening on port 4000');
    }
    catch (err) {
        shared_1.logger.error('Failed to start API Gateway', { error: err });
        process.exit(1);
    }
};
start();
