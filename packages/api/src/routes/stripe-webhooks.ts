import { FastifyPluginAsync } from 'fastify';
import { stripe } from '../lib/stripe';
import { prisma, SubscriptionStatus, InvoiceStatus } from '@apexseo/database';
import Stripe from 'stripe';

const stripeWebhooks: FastifyPluginAsync = async (fastify) => {
    // Register raw body parsing for Stripe webhooks
    fastify.addContentTypeParser('application/json', { parseAs: 'buffer' }, function (req, body, done) {
        done(null, body);
    });

    fastify.post('/webhooks/stripe', async (request, reply) => {
        const sig = request.headers['stripe-signature'] as string;
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

        if (!webhookSecret) {
            request.log.error('STRIPE_WEBHOOK_SECRET is not set');
            return reply.status(500).send('Webhook secret not configured');
        }

        let event: Stripe.Event;

        try {
            // Verify signature using the raw body buffer
            // request.body will be a Buffer due to 'parseAs: buffer'
            event = stripe.webhooks.constructEvent(request.body as Buffer, sig, webhookSecret);
        } catch (err: any) {
            request.log.warn(`Webhook signature verification failed: ${err.message}`);
            return reply.status(400).send(`Webhook Error: ${err.message}`);
        }

        // Handle the event
        switch (event.type) {
            case 'invoice.payment_succeeded': {
                const invoice = event.data.object as Stripe.Invoice;
                await handleInvoicePaymentSucceeded(invoice);
                break;
            }
            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                await handleSubscriptionUpdated(subscription);
                break;
            }
            default:
                // Unexpected event type
                request.log.info(`Unhandled event type ${event.type}`);
        }

        return { received: true };
    });
};

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    if (!invoice.customer_email || !(invoice as any).subscription) return;

    // Find user by Stripe Customer ID or Email
    const user = await prisma.user.findFirst({
        where: {
            OR: [
                { stripeCustomerId: invoice.customer as string },
                { email: invoice.customer_email }
            ]
        }
    });

    if (user) {
        // If user doesn't have stripeCustomerId set, update it
        if (!user.stripeCustomerId && typeof invoice.customer === 'string') {
            await prisma.user.update({
                where: { id: user.id },
                data: { stripeCustomerId: invoice.customer }
            });
        }

        // Create or Update Invoice Record
        await prisma.invoice.upsert({
            where: { id: invoice.id },
            create: {
                id: invoice.id,
                userId: user.id,
                amountPaid: (invoice.amount_paid / 100).toFixed(2), // Convert cents to dollars
                status: InvoiceStatus.PAID,
                invoicePdfUrl: invoice.invoice_pdf,
                hostedInvoiceUrl: invoice.hosted_invoice_url,
                createdAt: new Date(invoice.created * 1000)
            },
            update: {
                amountPaid: (invoice.amount_paid / 100).toFixed(2),
                status: InvoiceStatus.PAID,
                invoicePdfUrl: invoice.invoice_pdf,
                hostedInvoiceUrl: invoice.hosted_invoice_url
            }
        });
    }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    // Map Stripe status to our DB Enum
    const statusMap: Record<Stripe.Subscription.Status, SubscriptionStatus> = {
        active: SubscriptionStatus.ACTIVE,
        past_due: SubscriptionStatus.PAST_DUE,
        canceled: SubscriptionStatus.CANCELED,
        unpaid: SubscriptionStatus.UNPAID,
        incomplete: SubscriptionStatus.INCOMPLETE,
        incomplete_expired: SubscriptionStatus.INCOMPLETE_EXPIRED,
        trialing: SubscriptionStatus.TRIALING,
        paused: SubscriptionStatus.PAUSED
    };

    const status = statusMap[subscription.status] || SubscriptionStatus.ACTIVE;

    // Find user
    const customerId = subscription.customer as string;
    const user = await prisma.user.findUnique({
        where: { stripeCustomerId: customerId }
    });

    if (user) {
        await prisma.subscription.upsert({
            where: { id: subscription.id },
            create: {
                id: subscription.id,
                userId: user.id,
                status: status,
                currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
                cancelAtPeriodEnd: subscription.cancel_at_period_end
            },
            update: {
                status: status,
                currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
                cancelAtPeriodEnd: subscription.cancel_at_period_end
            }
        });
    }
}

export { stripeWebhooks };
