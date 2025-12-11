import Stripe from 'stripe';
import { getDriver, DATABASE, User, PLANS } from '@apexseo/shared';
import { logger } from '@apexseo/shared';
import { v4 as uuidv4 } from 'uuid';

export class BillingService {
    private stripe: Stripe;
    private readonly TRIAL_DAYS = 7;

    constructor() {
        if (!process.env.STRIPE_SECRET_KEY) {
            logger.warn('STRIPE_SECRET_KEY not set. Billing service will not function correctly.');
        }
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
            // apiVersion: '2025-01-27.acacia', // Removed to avoid type error
        });
    }

    private getSession() {
        const driver = getDriver();
        if (!driver) throw new Error('Neo4j driver not initialized');
        return driver.session({ database: DATABASE });
    }

    async createCustomer(user: User, paymentMethodId: string) {
        try {
            const customer = await this.stripe.customers.create({
                email: user.email,
                name: user.name,
                payment_method: paymentMethodId,
                invoice_settings: {
                    default_payment_method: paymentMethodId,
                },
            });
            return customer;
        } catch (error) {
            logger.error('Failed to create Stripe customer', { error, userId: user.id });
            throw error;
        }
    }

    async createSubscription(user: User, planId: string, paymentMethodId: string) {
        const customer = await this.createCustomer(user, paymentMethodId);

        // Calculate trial end date (7 days from now)
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + this.TRIAL_DAYS);
        // Stripe expects unix timestamp in seconds
        const trialEndUnix = Math.floor(trialEnd.getTime() / 1000);

        // We don't create a Stripe subscription YET effectively. 
        // Or we create it with a trial?
        // Constraint: "if they cancel before the 7 days it will not be billed after 7 days it should be billed."
        // Stripe has native trial support.

        try {
            // Find the Stripe Price ID for the plan from our DB or config
            // For now, assuming planId maps to priceId or passed explicitly.
            // Let's assume we look up plan details from Neo4j (omitted for brevity, can be added to repositories)
            // Mocking price ID for now or passing it in.

            // Actually, best practice is to create the subscription in Stripe with `trial_end`.
            // Stripe will automatically charge at the end of the trial unless canceled.
            // This perfectly matches the requirement.

            // BUT, we need the price ID. 
            // Let's assume planId IS the price ID for this implementation steps or we fetch it.
            // Lookup price ID from PLANS config
            const planConfig = Object.values(PLANS).find(p => p.id === planId) || Object.values(PLANS).find(p => p.priceId === planId);

            if (!planConfig) {
                throw new Error(`Invalid plan ID: ${planId}`);
            }

            const priceId = planConfig.priceId;

            const subscription = await this.stripe.subscriptions.create({
                customer: customer.id,
                items: [{ price: priceId }],
                trial_end: trialEndUnix,
                expand: ['latest_invoice.payment_intent'],
            });

            // Store in Neo4j
            await this.storeSubscriptionInGraph(user.id, subscription, trialEnd);

            return subscription;
        } catch (error) {
            logger.error('Failed to create Stripe subscription', { error, userId: user.id });
            throw error;
        }
    }

    private async storeSubscriptionInGraph(userId: string, stripeSub: Stripe.Subscription, trialEnd: Date) {
        const session = this.getSession();
        try {
            const subId = uuidv4();
            await session.run(`
                MATCH (u:User {id: $userId})
                CREATE (s:Subscription {
                    id: $subId,
                    stripe_subscription_id: $stripeSubId,
                    status: $status,
                    current_period_end: $currentPeriodEnd,
                    trial_ends_at: $trialEndsAt,
                    created_at: $now,
                    updated_at: $now
                })
                MERGE (a:Account {name: 'Personal Account', id: $accountId}) // Simplified account creation
                MERGE (u)-[:BELONGS_TO {role: 'OWNER'}]->(a)
                MERGE (a)-[:HAS_SUBSCRIPTION]->(s)
                // Link to Plan would go here if we had Plan nodes ready
           `, {
                userId,
                subId,
                stripeSubId: stripeSub.id,
                status: stripeSub.status, // likely 'trialing'
                current_period_end: new Date((stripeSub as any).current_period_end * 1000).toISOString(),
                trialEndsAt: trialEnd.toISOString(),
                now: new Date().toISOString(),
                accountId: uuidv4()
            });
        } finally {
            await session.close();
        }
    }

    async cancelSubscription(subscriptionId: string) {
        try {
            // Cancel at period end? Or immediately?
            // "if they cancel before the 7 days it will not be billed"
            // Immediate cancellation prevents future billing.
            const deleted = await this.stripe.subscriptions.cancel(subscriptionId);

            // Update Graph
            await this.updateSubscriptionStatusInGraph(subscriptionId, 'canceled');

            return deleted;
        } catch (error) {
            logger.error('Failed to cancel subscription', { error, subscriptionId });
            throw error;
        }
    }

    private async updateSubscriptionStatusInGraph(stripeSubId: string, status: string) {
        const session = this.getSession();
        try {
            await session.run(`
                MATCH (s:Subscription {stripe_subscription_id: $stripeSubId})
                SET s.status = $status, s.updated_at = $now
            `, {
                stripeSubId,
                status,
                now: new Date().toISOString()
            });
        } finally {
            await session.close();
        }
    }
}
