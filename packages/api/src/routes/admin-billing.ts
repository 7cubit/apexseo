import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma, UserRole } from '@apexseo/database';
import { requireRole } from '../middleware/rbac';
import { RefundService } from '../services/refund-service';

const refundService = new RefundService();

const adminBillingRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.addHook('preHandler', requireRole([UserRole.SUPER_ADMIN, UserRole.BILLING_ADMIN]));

    // GET /invoices/stats - MRR and Churn
    fastify.get('/stats', async (request, reply) => {
        // Simple MRR Calculation: Sum of all active subscriptions (assuming monthly for MVP)
        // For accurate MRR, we need to check plan price and interval.
        // Assuming we store price in Product and link User -> Plan.

        // Active Subscribers
        const activeSubs = await prisma.user.count({
            where: {
                status: 'ACTIVE',
                planId: { not: null }
            }
        });

        // Calculate MRR from active subscriptions
        // Fetch all active users with plans
        const usersWithPlans = await prisma.user.findMany({
            where: {
                status: 'ACTIVE',
                planId: { not: null }
            },
            include: { plan: true }
        });

        let mrr = 0;
        for (const user of usersWithPlans) {
            if (user.plan) {
                const price = Number(user.plan.price);
                const interval = user.plan.interval;
                if (interval === 'MONTHLY') {
                    mrr += price;
                } else if (interval === 'YEARLY') {
                    mrr += price / 12;
                }
            }
        }

        // Churn Rate (Mock logic for MVP or simple calc)
        // Churn = (Lost Customers / Total Customers at Start of Period) * 100
        // We need historical data for accurate churn. 
        // For now, let's return a static or calculated value based on 'CANCELED' vs 'ACTIVE'.
        const canceledSubs = await prisma.subscription.count({
            where: { status: 'CANCELED' }
        });
        const totalSubs = await prisma.subscription.count();
        const churnRate = totalSubs > 0 ? (canceledSubs / totalSubs) * 100 : 0;

        return {
            mrr: mrr.toFixed(2),
            activeSubscribers: activeSubs,
            churnRate: churnRate.toFixed(2)
        };
    });

    // POST /refunds - Issue Refund
    fastify.post('/refunds', {
        schema: {
            body: z.object({
                invoiceId: z.string(),
                amount: z.number().optional(),
                reason: z.string().optional()
            })
        }
    }, async (request, reply) => {
        const { invoiceId, amount, reason } = request.body as any;
        try {
            const refund = await refundService.createRefund(invoiceId, amount, reason);
            return refund;
        } catch (error: any) {
            request.log.error(`Refund failed: ${error.message}`);
            return reply.status(400).send({ error: error.message });
        }
    });

    // GET /users/:id/invoices - Get Invoices for User
    fastify.get('/users/:id/invoices', {
        schema: {
            params: z.object({ id: z.string() })
        }
    }, async (request, reply) => {
        const { id } = request.params as { id: string };
        const invoices = await prisma.invoice.findMany({
            where: { userId: id },
            include: { refunds: true },
            orderBy: { createdAt: 'desc' }
        });
        return invoices;
    });
};

export default adminBillingRoutes;
