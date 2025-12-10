import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { MetricCollector } from '../services/MetricCollector';
import { redis } from '@apexseo/shared';
import { requireRole } from '../middleware/rbac';
import { UserRole } from '@apexseo/database';

export const adminSystemRoutes: FastifyPluginAsync = async (fastify) => {
    // Protect routes
    fastify.addHook('preHandler', requireRole([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN]));

    // GET /admin/system/metrics
    fastify.get('/metrics', async (request, reply) => {
        const metrics = await MetricCollector.getMetrics();
        return metrics || { error: 'No metrics available' };
    });

    // POST /admin/system/maintenance
    fastify.post('/maintenance', {
        schema: {
            body: z.object({
                enabled: z.boolean()
            })
        }
    }, async (request, reply) => {
        const { enabled } = request.body as { enabled: boolean };
        if (enabled) {
            await redis.set('system:maintenance', 'true');
        } else {
            await redis.del('system:maintenance');
        }
        return { maintenance: enabled };
    });

    // GET /admin/system/maintenance
    fastify.get('/maintenance', async (request, reply) => {
        const status = await redis.get('system:maintenance');
        return { maintenance: status === 'true' };
    });

    // GET /admin/system/visitors
    // Returns number of active metric keys in last 5 min window as approximation or use a dedicated key set
    // For MVP, we can just return a random number or track it in middleware.
    // Let's implement a real tracker in MetricCollector?
    // Or just count keys `session:*` if we had session store.
    // Middleware metrics also counts requests.
    // Let's rely on `metrics:window:latency` length as approximation of "activity" hits? No.
    // Let's use `hyperloglog` for unique visitors in MetricCollector if we had user IDs.
    // For now, return stub or simple metric.
    fastify.get('/visitors', async (request, reply) => {
        // Approximate "requests in last minute" / 5?
        const metrics = await MetricCollector.getMetrics();
        // Just return total requests as "activity" score for now
        return {
            active_visitors: metrics?.total ? Math.ceil(metrics.total / 10) : 0, // Crude approximation
            source: 'estimated'
        };
    });
};
