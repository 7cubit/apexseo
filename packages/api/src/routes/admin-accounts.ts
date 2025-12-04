import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { AccountRepository, SubscriptionRepository } from '@apexseo/shared';

const accountRepo = new AccountRepository();
const subRepo = new SubscriptionRepository();

export default async function adminAccountRoutes(fastify: FastifyInstance) {
    // List Accounts
    fastify.get('/', {
        schema: {
            querystring: z.object({
                page: z.coerce.number().min(1).default(1),
                limit: z.coerce.number().min(1).max(100).default(10),
                search: z.string().optional()
            }),
            response: {
                200: z.object({
                    data: z.array(z.object({
                        id: z.string(),
                        name: z.string(),
                        created_at: z.string()
                    })),
                    meta: z.object({
                        total: z.number(),
                        page: z.number(),
                        limit: z.number(),
                        totalPages: z.number()
                    })
                })
            }
        },
        preHandler: [fastify.authenticateAdmin]
    }, async (request, reply) => {
        const { page, limit, search } = request.query as any;
        const offset = (page - 1) * limit;
        const { accounts, total } = await accountRepo.list(limit, offset, search);

        return {
            data: accounts,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    });

    // Get Account Details
    fastify.get('/:id', {
        schema: {
            params: z.object({
                id: z.string()
            }),
            response: {
                200: z.object({
                    account: z.object({
                        id: z.string(),
                        name: z.string(),
                        created_at: z.string()
                    }),
                    subscription: z.object({
                        id: z.string(),
                        status: z.string(),
                        current_period_end: z.string()
                    }).nullable(),
                    plan: z.object({
                        id: z.string(),
                        name: z.string(),
                        price: z.number(),
                        currency: z.string()
                    }).nullable()
                }),
                404: z.object({
                    message: z.string()
                })
            }
        },
        preHandler: [fastify.authenticateAdmin]
    }, async (request, reply) => {
        const { id } = request.params as any;
        const account = await accountRepo.findById(id);
        if (!account) {
            return reply.code(404).send({ message: 'Account not found' });
        }

        const subData = await subRepo.getAccountSubscription(id);

        return {
            account,
            subscription: subData?.subscription || null,
            plan: subData?.plan || null
        };
    });

    // Subscribe / Change Plan
    fastify.post('/:id/subscription', {
        schema: {
            params: z.object({
                id: z.string()
            }),
            body: z.object({
                planId: z.string()
            }),
            response: {
                200: z.object({
                    id: z.string(),
                    status: z.string()
                })
            }
        },
        preHandler: [fastify.authenticateAdmin]
    }, async (request, reply) => {
        const { id } = request.params as any;
        const { planId } = request.body as any;
        const subscription = await subRepo.subscribe(id, planId);
        return subscription;
    });

    // Cancel Subscription
    fastify.post('/:id/cancel', {
        schema: {
            params: z.object({
                id: z.string()
            }),
            body: z.object({
                subscriptionId: z.string()
            }),
            response: {
                200: z.object({
                    id: z.string(),
                    status: z.string()
                })
            }
        },
        preHandler: [fastify.authenticateAdmin]
    }, async (request, reply) => {
        const { subscriptionId } = request.body as any;
        const subscription = await subRepo.cancel(subscriptionId);
        return subscription;
    });
}
