"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.graphRoutes = void 0;
const zod_1 = require("zod");
const GraphService_1 = require("../services/GraphService");
const graphService = new GraphService_1.GraphService();
// const graphService = null as any;
const graphRoutes = async (fastify) => {
    const app = fastify.withTypeProvider();
    app.get('/visualize', {
        schema: {
            querystring: zod_1.z.object({
                siteId: zod_1.z.string(),
                depth: zod_1.z.coerce.number().optional().default(2),
                limit: zod_1.z.coerce.number().optional().default(100)
            }),
            response: {
                200: zod_1.z.object({
                    nodes: zod_1.z.array(zod_1.z.any()),
                    links: zod_1.z.array(zod_1.z.any())
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
            querystring: zod_1.z.object({
                siteId: zod_1.z.string()
            }),
            response: {
                200: zod_1.z.array(zod_1.z.object({
                    url: zod_1.z.string(),
                    score: zod_1.z.number().nullable()
                }))
            }
        }
    }, async (request, reply) => {
        const { siteId } = request.query;
        const data = await graphService.getPageRank(siteId);
        return reply.send(data);
    });
};
exports.graphRoutes = graphRoutes;
