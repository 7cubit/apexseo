import { FastifyPluginAsync } from 'fastify';
import { prisma } from '@apexseo/database';
import { z } from 'zod';

export const trackingRoutes: FastifyPluginAsync = async (fastify) => {

    // Pixel for Open Tracking
    fastify.get('/open', {
        schema: {
            querystring: z.object({
                cid: z.string().optional(), // Campaign ID
                uid: z.string().optional()  // User ID
            })
        }
    }, async (request, reply) => {
        const { cid, uid } = request.query as any;

        // 1x1 transparent GIF
        const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');

        reply.header('Content-Type', 'image/gif');
        reply.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        reply.send(pixel);

        // Async logging
        if (cid && uid) {
            try {
                // Update SentEmail record if we had the ID, or just Campaign Stats
                await prisma.emailCampaign.update({
                    where: { id: cid },
                    data: { openCount: { increment: 1 } }
                });

                // If we tracked specific email ID in query, we could update SentEmail.openedAt
            } catch (err) {
                request.log.error(err, 'Failed to track open');
            }
        }
    });

    // Click Tracking Redirect
    fastify.get('/click', {
        schema: {
            querystring: z.object({
                url: z.string().url(),
                cid: z.string().optional(),
                uid: z.string().optional()
            })
        }
    }, async (request, reply) => {
        const { url, cid, uid } = request.query as any;

        // Async logging
        if (cid) {
            prisma.emailCampaign.update({
                where: { id: cid },
                data: { clickCount: { increment: 1 } }
            }).catch(err => request.log.error(err));
        }

        return reply.redirect(url);
    });

    // Public Unsubscribe
    fastify.get('/unsubscribe', {
        schema: {
            querystring: z.object({
                token: z.string()
            })
        }
    }, async (request, reply) => {
        const { token } = request.query as any;

        const pref = await prisma.customerPreference.findUnique({
            where: { unsubscribeToken: token },
            include: { user: true }
        });

        if (!pref) {
            return reply.status(404).send('Invalid unsubscribe link.');
        }

        // Process unsubscribe
        await prisma.customerPreference.update({
            where: { id: pref.id },
            data: {
                newsletterOptIn: false,
                marketingOptIn: false
            }
        });

        return reply.type('text/html').send(`
            <html>
                <body style="font-family: sans-serif; padding: 40px; text-align: center;">
                    <h1>You have been unsubscribed.</h1>
                    <p>We've updated your preferences for ${pref.user.email}.</p>
                </body>
            </html>
        `);
    });
};
