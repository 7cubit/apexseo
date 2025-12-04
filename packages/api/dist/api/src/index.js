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
const graph_1 = __importDefault(require("./routes/graph"));
const agents_1 = __importDefault(require("./routes/agents"));
const schedules_1 = __importDefault(require("./routes/schedules"));
const keywords_1 = __importDefault(require("./routes/keywords"));
const content_1 = __importDefault(require("./routes/content"));
const projects_1 = __importDefault(require("./routes/projects"));
const alerts_1 = __importDefault(require("./routes/alerts"));
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
    timeWindow: '1 minute'
});
fastify.register(error_handler_1.default);
fastify.register(swagger_1.default);
fastify.register(auth_1.default);
fastify.register(tenancy_1.default);
// Register Routes
fastify.register(sites_1.default, { prefix: '/sites' });
fastify.register(analysis_1.default, { prefix: '/analysis' });
fastify.register(graph_1.default);
fastify.register(agents_1.default, { prefix: '/agents' });
fastify.register(schedules_1.default);
fastify.register(keywords_1.default);
fastify.register(content_1.default);
fastify.register(projects_1.default, { prefix: '/projects' });
fastify.register(alerts_1.default);
fastify.get('/health', async (request, reply) => {
    shared_1.logger.info('Health check requested');
    return { status: 'ok', timestamp: new Date().toISOString() };
});
// import { graphRoutes } from './routes/graph'; // Removed duplicate
// ... existing code ...
const start = async () => {
    try {
        await fastify.register(graph_1.default, { prefix: '/graph' });
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
