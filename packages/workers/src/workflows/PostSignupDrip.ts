import { proxyActivities, sleep } from '@temporalio/workflow';
import type * as activities from '../activities/email';

const { sendEmail } = proxyActivities<typeof activities>({
    startToCloseTimeout: '1 minute',
});

// Define templates inline or fetch them. For MVP, inline strings.
const WELCOME_EMAIL = (name: string) => `<h1>Welcome ${name}!</h1><p>Thanks for joining.</p>`;
const CHECKIN_EMAIL = (name: string) => `<h1>How is it going, ${name}?</h1><p>Any questions?</p>`;
const TIPS_EMAIL = (name: string) => `<h1>Pro Tips</h1><p>Here is how to get the most out of ApexSEO.</p>`;

export async function PostSignupDripWorkflow(args: { userId: string; email: string; name: string }): Promise<void> {
    const { userId, email, name } = args;

    // 1. Welcome (Immediate or small delay)
    await sleep('1 minute'); // Small delay to ensure DB consistency
    await sendEmail({
        to: email,
        subject: 'Welcome to ApexSEO!',
        html: WELCOME_EMAIL(name),
        userId
    });

    // 2. Day 3 Check-in
    await sleep('3 days');
    await sendEmail({
        to: email,
        subject: 'Checking in',
        html: CHECKIN_EMAIL(name),
        userId
    });

    // 3. Day 7 Tips
    await sleep('4 days'); // 3 + 4 = 7 days total
    await sendEmail({
        to: email,
        subject: 'Pro Tips',
        html: TIPS_EMAIL(name),
        userId
    });
}
