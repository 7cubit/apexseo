import sgMail from '@sendgrid/mail';
import { logger } from '../utils/logger';

export interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    campaignId?: string;
    templateId?: string;
    metadata?: Record<string, any>;
}

export class EmailClient {
    private isInitialized = false;
    private fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@apexseo.com';

    constructor() {
        const apiKey = process.env.SENDGRID_API_KEY;
        if (apiKey) {
            sgMail.setApiKey(apiKey);
            this.isInitialized = true;
        } else {
            logger.warn('SENDGRID_API_KEY not found. Email sending will be mocked.');
        }
    }

    async sendEmail(options: EmailOptions): Promise<boolean> {
        const { to, subject, html, campaignId, templateId, metadata } = options;

        if (!this.isInitialized) {
            logger.info(`[MOCK EMAIL] To: ${to} | Subject: ${subject}`);
            return true;
        }

        try {
            const msg = {
                to,
                from: this.fromEmail,
                subject,
                html,
                customArgs: {
                    campaignId: campaignId || '',
                    templateId: templateId || '',
                    ...metadata
                },
                trackingSettings: {
                    clickTracking: { enable: true },
                    openTracking: { enable: true }
                }
            };

            await sgMail.send(msg);
            logger.info(`Email sent to ${to}`);
            return true;
        } catch (error: any) {
            logger.error('Failed to send email', { error: error.message, body: error.response?.body });
            return false;
        }
    }
}

export const emailClient = new EmailClient();
