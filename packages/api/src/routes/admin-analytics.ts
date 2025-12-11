
import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { AnalyticsService } from '../services/analytics.service';
// import { AdminRole } from '@apexseo/shared';

const analyticsService = new AnalyticsService();

export async function adminAnalyticsRoutes(app: FastifyInstance) {
    const server = app.withTypeProvider<ZodTypeProvider>();

    server.get(
        '/financial-flow',
        {
            schema: {
                tags: ['Admin Analytics'],
                response: {
                    200: z.object({
                        nodes: z.array(z.object({
                            name: z.string()
                        })),
                        links: z.array(z.object({
                            source: z.number(),
                            target: z.number(),
                            value: z.number()
                        }))
                    })
                }
            },
            // preHandler: [app.authenticateAdmin] // Temporarily disabled for debugging
        },
        async (request, reply) => {
            try {
                return await analyticsService.getFinancialFlow();
            } catch (err) {
                request.log.error(err);
                throw err;
            }
        }
    );
}
