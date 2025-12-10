import { FastifyPluginAsync } from 'fastify';
import { redis, logger } from '@apexseo/shared';
import { prisma } from '@apexseo/database';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-12-18.acacia' as any, // Bypass strict type check for now if version is weird
});

// If prisma is not exported from shared, I might need to instantiate it or use fastify.prisma if available.
// Let's assume for now I need to instantiate or import.
import { PrismaClient } from '@prisma/client';
const db = new PrismaClient(); // Local instance for health check if shared one isn't easy to get, but ideally shared.

export const healthRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.get('/health', async (request, reply) => {
        const health = {
            status: 'ok',
            timestamp: new Date().toISOString(),
            services: {
                database: 'unknown',
                redis: 'unknown',
                stripe: 'unknown',
                email: 'unknown'
            }
        };

        let statusCode = 200;

        // Check Database
        try {
            await db.$queryRaw`SELECT 1`;
            health.services.database = 'healthy';
        } catch (error) {
            health.services.database = 'unhealthy';
            logger.error('Health Check: Database failed', error);
            statusCode = 503;
        }

        // Check Redis
        try {
            await redis.ping();
            health.services.redis = 'healthy';
        } catch (error) {
            health.services.redis = 'unhealthy';
            logger.error('Health Check: Redis failed', error);
            statusCode = 503;
        }

        // Check Stripe
        try {
            // Lightweight check - retrieve account check or just balance (requires key)
            // Or just check if key is present
            if (process.env.STRIPE_SECRET_KEY) {
                await stripe.balance.retrieve();
                health.services.stripe = 'healthy';
            } else {
                health.services.stripe = 'not_configured';
            }
        } catch (error) {
            health.services.stripe = 'unhealthy';
            logger.error('Health Check: Stripe failed', error);
            // Verify if stripe failure should take down health check? Probably not for global health, but yes for "system status"
        }

        // Check Email
        try {
            if (process.env.SENDGRID_API_KEY) {
                // SendGrid doesn't have a simple "ping", but we can assume healthy if key exists and no recent errors
                // or just check if env var exists.
                health.services.email = 'configured';
            } else {
                health.services.email = 'not_configured';
            }
        } catch (error) {
            health.services.email = 'unhealthy';
        }

        if (health.services.database === 'unhealthy' || health.services.redis === 'unhealthy') {
            health.status = 'degraded';
            statusCode = 503;
        }

        return reply.status(statusCode).send(health);
    });
};
