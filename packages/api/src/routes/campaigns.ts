import { FastifyPluginAsync } from 'fastify';
import { prisma } from '@apexseo/database';
import { z } from 'zod';
import { requireRole } from '../middleware/rbac';
import { emailClient } from '@apexseo/shared';

// Helper to replace variables
const interpolate = (html: string, user: any) => {
    return html.replace(/{{firstName}}/g, user.firstName || 'there')
        .replace(/{{email}}/g, user.email);
};

export const campaignRoutes: FastifyPluginAsync = async (fastify) => {

    // Create Campaign
    fastify.post('/', {
        preHandler: [requireRole(['SUPER_ADMIN', 'ADMIN_CRM'])],
        schema: {
            body: z.object({
                name: z.string(),
                subject: z.string(),
                body: z.string(), // HTML content
                segment: z.enum(['ALL', 'SUBSCRIBERS']).default('ALL')
            })
        }
    }, async (request, reply) => {
        // Create Template and Campaign in one go for simplicity or separate them via UI
        const { name, subject, body } = request.body as any;

        // Auto-create a template for this campaign
        const template = await prisma.emailTemplate.create({
            data: {
                name: `${name} Template`,
                subject,
                body
            }
        });

        const campaign = await prisma.emailCampaign.create({
            data: {
                name,
                subject,
                templateId: template.id,
                status: 'DRAFT'
            }
        });

        return campaign;
    });

    // List Campaigns
    fastify.get('/', {
        preHandler: [requireRole(['SUPER_ADMIN', 'ADMIN_CRM'])]
    }, async (request, reply) => {
        return prisma.emailCampaign.findMany({
            include: { template: true },
            orderBy: { createdAt: 'desc' }
        });
    });

    // Send Campaign
    fastify.post('/:id/send', {
        preHandler: [requireRole(['SUPER_ADMIN', 'ADMIN_CRM'])]
    }, async (request, reply) => {
        const { id } = request.params as any;

        const campaign = await prisma.emailCampaign.findUnique({
            where: { id },
            include: { template: true }
        });

        if (!campaign || !campaign.template) {
            return reply.status(404).send({ error: 'Campaign not found' });
        }

        if (campaign.status === 'COMPLETED' || campaign.status === 'SENDING') {
            return reply.status(400).send({ error: 'Campaign already sent or sending' });
        }

        // Update status
        await prisma.emailCampaign.update({ where: { id }, data: { status: 'SENDING' } });

        // Fetch target users
        // For MVP, simple loop. For prod, push to Queue.
        const users = await prisma.user.findMany({
            where: {
                deletedAt: null,
                // If segment logic exists, apply here. Assuming ALL for now.
                // Filter by opt-in later if strict
            },
            include: { preferences: true }
        });

        // Async processing (don't block response)
        (async () => {
            let sentCount = 0;
            const baseUrl = process.env.API_BASE_URL || 'http://localhost:3001'; // Tracking domain

            for (const user of users) {
                // Check opt-in if needed. (Assuming strict opt-in)
                // if (!user.preferences?.newsletterOptIn) continue;

                // Create tracking links
                const trackingPixel = `${baseUrl}/tracking/open?cid=${campaign.id}&uid=${user.id}`;
                const unsubscribeLink = `${baseUrl}/tracking/unsubscribe?token=${user.preferences?.unsubscribeToken || 'fallback'}`;

                let html = interpolate(campaign.template!.body, user);

                // Append footer
                html += `
                    <div style="margin-top: 20px; font-size: 12px; color: #888;">
                        <a href="${unsubscribeLink}">Unsubscribe</a>
                        <img src="${trackingPixel}" width="1" height="1" alt="" />
                    </div>
                `;

                const sent = await emailClient.sendEmail({
                    to: user.email,
                    subject: campaign.subject,
                    html: html,
                    campaignId: campaign.id,
                    metadata: { userId: user.id }
                });

                if (sent) {
                    sentCount++;
                    // Log SentEmail
                    await prisma.sentEmail.create({
                        data: {
                            userId: user.id,
                            campaignId: campaign.id,
                            subject: campaign.subject,
                            to: user.email
                        }
                    });
                }
            }

            await prisma.emailCampaign.update({
                where: { id },
                data: {
                    status: 'COMPLETED',
                    totalSent: sentCount,
                    sentAt: new Date()
                }
            });
        })();

        return { success: true, message: `Sending to ${users.length} users started.` };
    });
};
