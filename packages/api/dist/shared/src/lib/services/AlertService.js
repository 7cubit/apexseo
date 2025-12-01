"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertService = void 0;
class AlertService {
    static async sendAlert(alert) {
        console.log(`Sending alert: ${alert.message}`);
        // Send to Slack if configured
        if (this.SLACK_WEBHOOK_URL) {
            await this.sendToSlack(alert);
        }
        // Send email if configured
        if (this.SMTP_HOST && this.ALERT_EMAIL) {
            await this.sendEmail(alert);
        }
    }
    static async sendToSlack(alert) {
        try {
            const color = this.getSeverityColor(alert.severity);
            const payload = {
                attachments: [{
                        color,
                        title: `${alert.type.toUpperCase()} Alert`,
                        text: alert.message,
                        fields: [
                            { title: 'Site', value: alert.site_id, short: true },
                            { title: 'Severity', value: alert.severity, short: true },
                        ],
                        footer: 'ApexSEO',
                        ts: Math.floor(Date.now() / 1000)
                    }]
            };
            await fetch(this.SLACK_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            console.log('Slack notification sent');
        }
        catch (error) {
            console.error('Failed to send Slack notification:', error);
        }
    }
    static async sendEmail(alert) {
        // For MVP, we'll log the email intent
        // In production, use nodemailer or similar
        console.log(`[EMAIL] To: ${this.ALERT_EMAIL}`);
        console.log(`[EMAIL] Subject: ${alert.type.toUpperCase()} Alert - ${alert.site_id}`);
        console.log(`[EMAIL] Body: ${alert.message}`);
        // TODO: Implement actual email sending with nodemailer
        // const transporter = nodemailer.createTransport({ ... });
        // await transporter.sendMail({ ... });
    }
    static getSeverityColor(severity) {
        switch (severity) {
            case 'critical': return 'danger';
            case 'high': return 'warning';
            case 'medium': return '#ffcc00';
            case 'low': return 'good';
            default: return '#808080';
        }
    }
}
exports.AlertService = AlertService;
AlertService.SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
AlertService.SMTP_HOST = process.env.SMTP_HOST;
AlertService.SMTP_USER = process.env.SMTP_USER;
AlertService.SMTP_PASS = process.env.SMTP_PASS;
AlertService.ALERT_EMAIL = process.env.ALERT_EMAIL;
