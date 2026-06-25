import { Worker, Job } from 'bullmq';
import Stripe from 'stripe';
import { prisma, SubscriptionStatus, InvoiceStatus } from '@apexseo/database';
import Redis from 'ioredis';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2024-12-18.acacia' as any, // Bypass strict version check
});

const connection = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
    maxRetriesPerRequest: null,
});

export const runStripeSyncWorker = () => {
    const worker = new Worker('stripe-sync', async (job: Job) => {
        console.log(`Processing stripe-sync job ${job.id}`);
        try {
            await syncStripeData();
            console.log(`Job ${job.id} completed`);
        } catch (error) {
            console.error(`Job ${job.id} failed`, error);
            throw error;
        }
    }, { connection });

    worker.on('completed', job => {
        console.log(`${job.id} has completed!`);
    });

    worker.on('failed', (job, err) => {
        console.log(`${job?.id} has failed with ${err.message}`);
    });
};

async function syncStripeData() {
    // 1. Sync Subscriptions (Active/Past Due/Trialling)
    // For MVP, limiting to 100 recent.
    const subscriptions = await stripe.subscriptions.list({
        limit: 100,
        status: 'all', // Fetch all statuses
        expand: ['data.customer'] // to get customer email if needed
    });

    for (const sub of subscriptions.data) {
        await upsertSubscription(sub);
    }

    // 2. Sync Invoices (Last 30 days)
    // Note: Creating date range for last 30 days
    const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);
    const invoices = await stripe.invoices.list({
        limit: 100,
        created: { gte: thirtyDaysAgo }
    });

    for (const inv of invoices.data) {
        await upsertInvoice(inv);
    }
}

async function upsertSubscription(sub: Stripe.Subscription) {
    const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;

    // Find User
    const user = await prisma.user.findUnique({
        where: { stripeCustomerId: customerId }
    });

    if (!user) return; // Skip if no user found with this customer ID

    const statusMap: Record<string, SubscriptionStatus> = {
        'active': SubscriptionStatus.ACTIVE,
        'past_due': SubscriptionStatus.PAST_DUE,
        'canceled': SubscriptionStatus.CANCELED,
        'unpaid': SubscriptionStatus.UNPAID,
        'incomplete': SubscriptionStatus.INCOMPLETE,
        'incomplete_expired': SubscriptionStatus.INCOMPLETE_EXPIRED,
        'trialing': SubscriptionStatus.TRIALING,
        'paused': SubscriptionStatus.PAUSED
    };

    await prisma.subscription.upsert({
        where: { id: sub.id },
        create: {
            id: sub.id,
            userId: user.id,
            status: statusMap[sub.status] || SubscriptionStatus.ACTIVE,
            currentPeriodEnd: new Date((sub as any).current_period_end * 1000),
            cancelAtPeriodEnd: sub.cancel_at_period_end
        },
        update: {
            status: statusMap[sub.status] || SubscriptionStatus.ACTIVE,
            currentPeriodEnd: new Date((sub as any).current_period_end * 1000),
            cancelAtPeriodEnd: sub.cancel_at_period_end
        }
    });
}

async function upsertInvoice(inv: Stripe.Invoice) {
    const customerId = typeof inv.customer === 'string' ? inv.customer : inv.customer?.id;
    if (!customerId) return;

    const user = await prisma.user.findUnique({
        where: { stripeCustomerId: customerId }
    });

    if (!user) return;

    await prisma.invoice.upsert({
        where: { id: inv.id },
        create: {
            id: inv.id,
            userId: user.id,
            amountPaid: (inv.amount_paid / 100).toFixed(2),
            status: inv.status === 'paid' ? InvoiceStatus.PAID :
                inv.status === 'open' ? InvoiceStatus.OPEN :
                    inv.status === 'void' ? InvoiceStatus.VOID : InvoiceStatus.UNCOLLECTIBLE,
            invoicePdfUrl: inv.invoice_pdf,
            hostedInvoiceUrl: inv.hosted_invoice_url,
            createdAt: new Date(inv.created * 1000)
        },
        update: {
            amountPaid: (inv.amount_paid / 100).toFixed(2),
            status: inv.status === 'paid' ? InvoiceStatus.PAID :
                inv.status === 'open' ? InvoiceStatus.OPEN :
                    inv.status === 'void' ? InvoiceStatus.VOID : InvoiceStatus.UNCOLLECTIBLE,
            invoicePdfUrl: inv.invoice_pdf,
            hostedInvoiceUrl: inv.hosted_invoice_url
        }
    });
}
