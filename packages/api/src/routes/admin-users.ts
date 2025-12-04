import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { UserService } from '../services/user.service';
import { AdminRole } from '@apexseo/shared';

const userService = new UserService();

export async function adminUserRoutes(app: FastifyInstance) {
    const server = app.withTypeProvider<ZodTypeProvider>();

    // List Users
    server.get(
        '/',
        {
            schema: {
                tags: ['Admin Users'],
                querystring: z.object({
                    page: z.coerce.number().min(1).default(1),
                    limit: z.coerce.number().min(1).max(100).default(10),
                    search: z.string().optional()
                }),
                response: {
                    200: z.object({
                        data: z.array(z.object({
                            id: z.string(),
                            email: z.string(),
                            name: z.string().optional(),
                            image: z.string().optional(),
                            is_suspended: z.boolean(),
                            created_at: z.string(),
                            last_login_at: z.string().optional()
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
            preHandler: [app.authenticateAdmin]
        },
        async (request, reply) => {
            const { page, limit, search } = request.query;
            return userService.listUsers(page, limit, search);
        }
    );

    // Get User Detail
    server.get(
        '/:id',
        {
            schema: {
                tags: ['Admin Users'],
                params: z.object({
                    id: z.string()
                }),
                response: {
                    200: z.object({
                        id: z.string(),
                        email: z.string(),
                        name: z.string().optional(),
                        image: z.string().optional(),
                        is_suspended: z.boolean(),
                        created_at: z.string(),
                        last_login_at: z.string().optional()
                    }),
                    404: z.object({
                        message: z.string()
                    })
                }
            },
            preHandler: [app.authenticateAdmin]
        },
        async (request, reply) => {
            const user = await userService.getUser(request.params.id);
            if (!user) return reply.status(404).send({ message: 'User not found' });
            return user;
        }
    );

    // Suspend User
    server.post(
        '/:id/suspend',
        {
            schema: {
                tags: ['Admin Users'],
                params: z.object({
                    id: z.string()
                }),
                response: {
                    200: z.object({
                        id: z.string(),
                        is_suspended: z.boolean()
                    }),
                    404: z.object({
                        message: z.string()
                    })
                }
            },
            preHandler: [app.authenticateAdmin, app.requireAdminRole([AdminRole.SUPER_ADMIN, AdminRole.SUPPORT_ADMIN])]
        },
        async (request, reply) => {
            const user = await userService.suspendUser(request.params.id);
            if (!user) return reply.status(404).send({ message: 'User not found' });
            return { id: user.id, is_suspended: user.is_suspended };
        }
    );

    // Unsuspend User
    server.post(
        '/:id/unsuspend',
        {
            schema: {
                tags: ['Admin Users'],
                params: z.object({
                    id: z.string()
                }),
                response: {
                    200: z.object({
                        id: z.string(),
                        is_suspended: z.boolean()
                    }),
                    404: z.object({
                        message: z.string()
                    })
                }
            },
            preHandler: [app.authenticateAdmin, app.requireAdminRole([AdminRole.SUPER_ADMIN, AdminRole.SUPPORT_ADMIN])]
        },
        async (request, reply) => {
            const user = await userService.unsuspendUser(request.params.id);
            if (!user) return reply.status(404).send({ message: 'User not found' });
            return { id: user.id, is_suspended: user.is_suspended };
        }
    );

    // Impersonate User
    server.post(
        '/:id/impersonate',
        {
            schema: {
                tags: ['Admin Users'],
                params: z.object({
                    id: z.string()
                }),
                response: {
                    200: z.object({
                        token: z.string()
                    }),
                    404: z.object({
                        message: z.string()
                    }),
                    400: z.object({
                        message: z.string()
                    })
                }
            },
            preHandler: [app.authenticateAdmin, app.requireAdminRole([AdminRole.SUPER_ADMIN, AdminRole.SUPPORT_ADMIN])]
        },
        async (request, reply) => {
            try {
                return await userService.impersonateUser(request.params.id, reply);
            } catch (error: any) {
                return reply.status(400).send({ message: error.message });
            }
        }
    );
}
