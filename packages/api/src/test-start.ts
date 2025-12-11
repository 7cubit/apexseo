
import Fastify from 'fastify';
import { logger } from '@apexseo/shared';
import keywordsRoutes from './routes/keywords';
import { graphRoutes } from './routes/graph';
import analysisRoutes from './routes/analysis';

import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';

const fastify = Fastify({ logger: true });

fastify.setValidatorCompiler(validatorCompiler);
fastify.setSerializerCompiler(serializerCompiler);

// Mock auth decorator
fastify.decorate("authenticate", async (request: any, reply: any) => { });

fastify.register(keywordsRoutes);
fastify.register(graphRoutes);
fastify.register(analysisRoutes);

fastify.get('/', async () => {
    return { hello: 'world' };
});

const start = async () => {
    try {
        await fastify.listen({ port: 4000, host: '0.0.0.0' });
        console.log('Test server listening on 4000');
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

start();
