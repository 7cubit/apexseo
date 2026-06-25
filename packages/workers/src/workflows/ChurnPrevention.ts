import { proxyActivities } from '@temporalio/workflow';
import type * as crmActivities from '../activities/crm';
import type * as emailActivities from '../activities/email';

const { findInactiveUsers, getUserDetails, markChurnEmailSent } = proxyActivities<typeof crmActivities>({
    startToCloseTimeout: '1 minute',
});

const { sendEmail } = proxyActivities<typeof emailActivities>({
    startToCloseTimeout: '1 minute',
});

export async function ChurnPreventionWorkflow(): Promise<void> {
    // 1. Find inactive users (e.g., 30 days)
    const inactiveUserIds = await findInactiveUsers(30);

    for (const userId of inactiveUserIds) {
        // Fetch details (could be done in batch, but simple loop for MVP)
        const user = await getUserDetails(userId);
        if (!user || !user.email) continue;

        // Send Email
        await sendEmail({
            to: user.email,
            subject: 'We miss you!',
            html: `<h1>Come back!</h1><p>We haven't seen you in a while.</p>`,
            userId
        });

        await markChurnEmailSent(userId);
    }
}
