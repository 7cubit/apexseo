import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma, UserRole } from '@apexseo/database';
import { requireRole } from '../middleware/rbac';
import { CreateProductSchema, UpdateProductSchema } from '../schemas';

const adminProductRoutes: FastifyPluginAsync = async (fastify) => {
    // Only Billing/Super Admin can manage products
    fastify.addHook('preHandler', requireRole([UserRole.SUPER_ADMIN, UserRole.BILLING_ADMIN]));

    // GET /products
    fastify.get('/', async () => {
        return prisma.product.findMany({
            orderBy: { price: 'asc' },
            where: { isActive: true } // or allow filter
        });
    });

    // POST /products
    fastify.post('/', {
        schema: { body: CreateProductSchema }
    }, async (request) => {
        const data = request.body as z.infer<typeof CreateProductSchema>;
        return prisma.product.create({ data });
    });

    // PATCH /products/:id
    fastify.patch('/:id', {
        schema: {
            params: z.object({ id: z.string() }),
            body: UpdateProductSchema
        }
    }, async (request) => {
        const { id } = request.params as { id: string };
        const data = request.body as z.infer<typeof UpdateProductSchema>;
        return prisma.product.update({ where: { id }, data });
    });

    // DELETE /products/:id (Soft?)
    fastify.delete('/:id', {
        schema: { params: z.object({ id: z.string() }) }
    }, async (request) => {
        const { id } = request.params as { id: string };
        // Hard or soft? Product deletion is risky if users attached.
        // Let's just set isActive = false
        return prisma.product.update({
            where: { id },
            data: { isActive: false }
        });
    });
};

export default adminProductRoutes;
