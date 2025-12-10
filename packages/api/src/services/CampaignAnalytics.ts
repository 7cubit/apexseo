import { prisma } from '@apexseo/database';

export class CampaignAnalytics {
    async getCampaignStats(campaignId: string) {
        const campaign = await prisma.emailCampaign.findUnique({
            where: { id: campaignId },
            include: {
                _count: {
                    select: {
                        emails: true // Total sent emails in the SentEmail table (redundant with totalSent but good for verification)
                    }
                }
            }
        });

        if (!campaign) throw new Error('Campaign not found');

        const openRate = campaign.totalSent > 0 ? (campaign.openCount / campaign.totalSent) * 100 : 0;
        const clickRate = campaign.totalSent > 0 ? (campaign.clickCount / campaign.totalSent) * 100 : 0;

        return {
            id: campaign.id,
            name: campaign.name,
            sent: campaign.totalSent,
            opens: campaign.openCount,
            clicks: campaign.clickCount,
            openRate: parseFloat(openRate.toFixed(2)),
            clickRate: parseFloat(clickRate.toFixed(2)),
            status: campaign.status,
            sentAt: campaign.sentAt
        };
    }

    async getUserEngagement(userId: string) {
        const sent = await prisma.sentEmail.count({ where: { userId } });
        const opened = await prisma.sentEmail.count({ where: { userId, openedAt: { not: null } } });
        const clicked = await prisma.sentEmail.count({ where: { userId, clickedAt: { not: null } } });

        return {
            sent,
            opened,
            clicked,
            openRate: sent > 0 ? (opened / sent) * 100 : 0,
            clickRate: sent > 0 ? (clicked / sent) * 100 : 0
        };
    }

    async getOverallStats() {
        const totalSent = await prisma.emailCampaign.aggregate({
            _sum: { totalSent: true }
        });

        const totalOpens = await prisma.emailCampaign.aggregate({
            _sum: { openCount: true }
        });

        const totalClicks = await prisma.emailCampaign.aggregate({
            _sum: { clickCount: true }
        });

        const sent = totalSent._sum.totalSent || 0;
        const opens = totalOpens._sum.openCount || 0;
        const clicks = totalClicks._sum.clickCount || 0;

        return {
            totalSent: sent,
            totalOpens: opens,
            totalClicks: clicks,
            globalOpenRate: sent > 0 ? (opens / sent) * 100 : 0,
            globalClickRate: sent > 0 ? (clicks / sent) * 100 : 0
        };
    }
}

export const campaignAnalytics = new CampaignAnalytics();
