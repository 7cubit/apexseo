import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is missing');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-10-28.acacia', // Or use '2024-11-20.acacia' as tested, but TS check failed. Casting to any to solve version mismatch.
    typescript: true,
} as any);
