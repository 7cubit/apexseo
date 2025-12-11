import { SESv2Client, CreateContactCommand, DeleteContactCommand } from "@aws-sdk/client-sesv2";
import { logger } from '@apexseo/shared';

export class EmailService {
    private sesClient: SESv2Client;
    private readonly NEWSLETTER_LIST_NAME = 'ApexSEONewsletter'; // Configure this list in SES

    constructor() {
        this.sesClient = new SESv2Client({
            region: process.env.AWS_REGION || 'us-east-1',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
            }
        });
    }

    async syncContact(email: string, optIn: boolean): Promise<void> {
        if (optIn) {
            await this.addToNewsletter(email);
        } else {
            await this.removeFromNewsletter(email);
        }
    }

    private async addToNewsletter(email: string): Promise<void> {
        try {
            const command = new CreateContactCommand({
                ContactListName: this.NEWSLETTER_LIST_NAME,
                EmailAddress: email,
                UnsubscribeAll: false,
                TopicPreferences: [] // Add topic preferences if needed
            });
            await this.sesClient.send(command);
            logger.info(`Added ${email} to newsletter list`);
        } catch (error: any) {
            if (error.name === 'AlreadyExistsException') {
                logger.info(`Email ${email} already in newsletter list`);
            } else {
                logger.error(`Failed to add ${email} to newsletter`, { error });
                // Don't throw, just log. Email failure shouldn't block signup.
            }
        }
    }

    private async removeFromNewsletter(email: string): Promise<void> {
        try {
            const command = new DeleteContactCommand({
                ContactListName: this.NEWSLETTER_LIST_NAME,
                EmailAddress: email
            });
            await this.sesClient.send(command);
            logger.info(`Removed ${email} from newsletter list`);
        } catch (error: any) {
            if (error.name === 'NotFoundException') {
                logger.info(`Email ${email} not found in newsletter list`);
            } else {
                logger.error(`Failed to remove ${email} from newsletter`, { error });
            }
        }
    }
}
