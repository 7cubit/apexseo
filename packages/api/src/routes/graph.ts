import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { GraphService } from '../services/GraphService';

const graphService = new GraphService();

export const graphRoutes: FastifyPluginAsync = async (fastify) => {
    const app = fastify.withTypeProvider<ZodTypeProvider>();

    app.get('/visualize', {
        schema: {
            querystring: z.object({
                siteId: z.string(),
                depth: z.coerce.number().optional().default(2),
                limit: z.coerce.number().optional().default(100)
            }),
            response: {
                200: z.object({
                    nodes: z.array(z.any()),
                    links: z.array(z.any())
                })
            }
        }
    }, async (request, reply) => {
        const { siteId, depth, limit } = request.query;
        const data = await graphService.getSubgraph(siteId, depth, limit);
        return reply.send(data);
    });

    app.get('/pagerank', {
        schema: {
            querystring: z.object({
                siteId: z.string()
            }),
            response: {
                200: z.array(z.object({
                    url: z.string(),
                    score: z.number().nullable()
                }))
            }
        }
    }, async (request, reply) => {
        const { siteId } = request.query;
        const data = await graphService.getPageRank(siteId);
        return reply.send(data);
    });
};
