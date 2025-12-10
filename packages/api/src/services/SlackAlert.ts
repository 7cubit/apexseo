import axios from 'axios';
import { logger } from '@apexseo/shared';

export class SlackAlert {
    private static webhookUrl = process.env.SLACK_WEBHOOK_URL;

    static async send(message: string, blocks?: any[]) {
        if (!this.webhookUrl) {
            logger.warn('Slack Webhook URL not configured, skipping alert');
            return;
        }

        try {
            await axios.post(this.webhookUrl, {
                text: message,
                blocks
            });
        } catch (error) {
            logger.error('Failed to send Slack alert', error);
        }
    }

    static async sendErrorAlert(error: Error, context: Record<string, any>) {
        const payload = {
            text: `🚨 API Error: ${error.message}`,
            blocks: [
                {
                    type: "header",
                    text: {
                        type: "plain_text",
                        text: "🚨 Critical API Error"
                    }
                },
                {
                    type: "section",
                    fields: [
                        {
                            type: "mrkdwn",
                            text: `*Message:*\n${error.message}`
                        },
                        {
                            type: "mrkdwn",
                            text: `*Route:*\n${context.route || 'Unknown'}`
                        }
                    ]
                },
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `*Stack Trace:*\n\`\`\`${error.stack?.substring(0, 500)}\`\`\``
                    }
                }
            ]
        };
        await this.send(payload.text, payload.blocks);
    }
}
