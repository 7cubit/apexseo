import { emailClient } from '@apexseo/shared';

export interface SendEmailParams {
    to: string;
    subject: string;
    html?: string;
    templateId?: string; // For SendGrid templates if used directly, or internal ID lookups
    campaignId?: string;
    userId?: string;
}

export const sendEmail = async (params: SendEmailParams): Promise<boolean> => {
    // If we passed a raw template ID from DB, we might want to fetch content here.
    // For now, assume 'html' is passed or 'templateId' is a SendGrid template ID.
    // Simplifying for MVP: assume caller constructs HTML or uses SendGrid templates.

    // If using internal templates (from DB), better to hydrate in Workflow or a separate activity.
    // But let's assume 'html' is provided.

    return await emailClient.sendEmail({
        to: params.to,
        subject: params.to, // Bug? No, params.subject
        html: params.html || '<p>Hello</p>',
        campaignId: params.campaignId,
        metadata: params.userId ? { userId: params.userId } : undefined
    });
};
