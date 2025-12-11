import { FastifyPluginAsync } from 'fastify';
import { getDriver, DATABASE } from '@apexseo/shared';

export const adminSubscriptionRoutes: FastifyPluginAsync = async (fastify) => {

    fastify.get('/', async (request, reply) => {
        const driver = getDriver();
        if (!driver) return reply.status(500).send({ error: 'Database connection failed' });

        const session = driver.session({ database: DATABASE });
        const { limit = 10, offset = 0, status } = request.query as any;

        try {
            let query = `
                MATCH (s:Subscription)
                OPTIONAL MATCH (a:Account)-[:HAS_SUBSCRIPTION]->(s)
                OPTIONAL MATCH (u:User)-[:BELONGS_TO]->(a)
                OPTIONAL MATCH (s)-[:IS_ON_PLAN]->(p:Plan)
            `;

            const params: any = {
                limit: parseInt(limit),
                offset: parseInt(offset)
            };

            if (status) {
                query += ` WHERE s.status = $status`;
                params.status = status;
            }

            query += `
                RETURN s, u.email as user_email, u.name as user_name, p.name as plan_name
                ORDER BY s.created_at DESC
                SKIP $offset
                LIMIT $limit
            `;

            const result = await session.run(query, params);

            const subscriptions = result.records.map((record: any) => ({
                ...record.get('s').properties,
                user: {
                    email: record.get('user_email'),
                    name: record.get('user_name')
                },
                plan: record.get('plan_name')
            }));

            return { data: subscriptions };
        } finally {
            await session.close();
        }
    });

    fastify.get('/stats', async (request, reply) => {
        const driver = getDriver();
        if (!driver) return reply.status(500).send({ error: 'Database connection failed' });

        const session = driver.session({ database: DATABASE });
        try {
            const result = await session.run(`
                MATCH (s:Subscription)
                RETURN 
                    count(s) as total_subscriptions,
                    sum(CASE WHEN s.status = 'active' THEN 1 ELSE 0 END) as active_subscriptions,
                    sum(CASE WHEN s.status = 'trialing' THEN 1 ELSE 0 END) as trialing_subscriptions
            `);

            const record = result.records[0];
            return {
                total: record.get('total_subscriptions').toNumber(),
                active: record.get('active_subscriptions').toNumber(),
                trialing: record.get('trialing_subscriptions').toNumber()
            };
        } finally {
            await session.close();
        }
    });
};
