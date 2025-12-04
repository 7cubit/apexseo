import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { ZodError } from 'zod';

export default fp(async (fastify: FastifyInstance) => {
    fastify.setErrorHandler((error, request, reply) => {
        if (error instanceof ZodError) {
            reply.status(400).send({
                statusCode: 400,
                error: 'Bad Request',
                message: 'Validation Error',
                details: error.issues
            });
            return;
        }

        const err = error as any;
        if (err.statusCode && err.statusCode < 500) {
            reply.status(err.statusCode).send({
                statusCode: err.statusCode,
                error: err.name,
                message: err.message
            });
            return;
        }

        request.log.error(error);
        reply.status(500).send({
            statusCode: 500,
            error: 'Internal Server Error',
            message: 'Something went wrong'
        });
    });
});
