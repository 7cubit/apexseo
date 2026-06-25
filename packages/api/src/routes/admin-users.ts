import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma, UserRole, UserStatus } from '@apexseo/database';
import { requireRole } from '../middleware/rbac';
import { CreateUserSchema, UpdateUserSchema, BulkActionSchema } from '../schemas';

const adminUserRoutes: FastifyPluginAsync = async (fastify) => {
    // Protect all routes
    fastify.addHook('preHandler', requireRole([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN]));

    // GET /users - List with filtering
    fastify.get('/', {
        schema: {
            querystring: z.object({
                search: z.string().optional(),
                role: z.nativeEnum(UserRole).optional(),
                status: z.nativeEnum(UserStatus).optional(),
                page: z.coerce.number().default(1),
                limit: z.coerce.number().default(20),
                planId: z.string().optional(),
            })
        }
    }, async (request, reply) => {
        const { search, role, status, page, limit, planId } = request.query as any;
        const skip = (page - 1) * limit;

        const where: any = {
            deletedAt: null // Exclude soft deleted by default
        };

        if (search) {
            where.OR = [
                { email: { contains: search, mode: 'insensitive' } },
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (role) where.role = role;
        if (status) where.status = status;
        if (planId) where.planId = planId;

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { plan: true }
            }),
            prisma.user.count({ where })
        ]);

        return { data: users, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
    });

    // GET /users/:id - Get Single User
    fastify.get('/:id', {
        schema: { params: z.object({ id: z.string() }) }
    }, async (request, reply) => {
        const { id } = request.params as { id: string };
        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                plan: true,
                auditLogs: { take: 10, orderBy: { createdAt: 'desc' } },
                sentEmails: { take: 20, orderBy: { sentAt: 'desc' } }
            } // Include recent logs and emails
        });
        if (!user) return reply.status(404).send({ error: 'User not found' });
        return user;
    });

    // POST /users - Create User
    fastify.post('/', {
        schema: { body: CreateUserSchema }
    }, async (request, reply) => {
        const data = request.body as z.infer<typeof CreateUserSchema>;
        // ID handling: In real app, we'd trigger Clerk invitation here.
        // For now, assume ID is generated or passed (if syncing).
        // Let's rely on Prisma 'cuid' or upstream ID. 
        // Since `id` is not standard default in our schema (it was @id without default), we must provide it.
        // We should probably allow providing ID or generate one if treating as "Pending Invitation".
        // For simplicity, generate a placeholder ID or expect one.
        // Let's auto-generate if not present (requires schema change or manual gen here).
        const id = `user_${Math.random().toString(36).substring(2, 15)}`;

        const user = await prisma.user.create({
            data: {
                id,
                ...data,
            }
        });

        // Log audit explicitly if middleware doesn't catch implicitly or for more detail
        return user;
    });

    // PATCH /users/:id - Update User
    fastify.patch('/:id', {
        schema: {
            params: z.object({ id: z.string() }),
            body: UpdateUserSchema
        }
    }, async (request, reply) => {
        const { id } = request.params as { id: string };
        const data = request.body as any;

        const user = await prisma.user.update({
            where: { id },
            data
        });
        return user;
    });

    // DELETE /users/:id - Soft Delete
    fastify.delete('/:id', {
        schema: { params: z.object({ id: z.string() }) }
    }, async (request, reply) => {
        const { id } = request.params as { id: string };
        await prisma.user.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                status: 'SUSPENDED'
            }
        });
        return { success: true };
    });

    // POST /users/bulk - Bulk Actions
    fastify.post('/bulk', {
        schema: { body: BulkActionSchema }
    }, async (request, reply) => {
        const { userIds, action } = request.body as z.infer<typeof BulkActionSchema>;

        switch (action) {
            case 'suspend':
                await prisma.user.updateMany({
                    where: { id: { in: userIds } },
                    data: { status: 'SUSPENDED' }
                });
                break;
            case 'activate':
                await prisma.user.updateMany({
                    where: { id: { in: userIds } },
                    data: { status: 'ACTIVE' }
                });
                break;
            case 'delete':
                await prisma.user.updateMany({
                    where: { id: { in: userIds } },
                    data: { deletedAt: new Date(), status: 'SUSPENDED' }
                });
                break;
            case 'reset_password':
                // In reality, trigger Clerk password reset
                // request.log.info(`Mock triggering password reset for ${userIds.length} users`);
                break;
        }
        return { success: true, count: userIds.length, action };
    });
};

export { adminUserRoutes }; // Named export
