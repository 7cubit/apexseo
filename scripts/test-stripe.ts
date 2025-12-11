
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripeKey = process.env.STRIPE_SECRET_KEY;

if (!stripeKey) {
    console.error('Error: STRIPE_SECRET_KEY is not defined in environment variables.');
    process.exit(1);
}

const stripe = new Stripe(stripeKey, {
    apiVersion: '2024-12-18.acacia' as any,
});

async function verifyStripe() {
    console.log(`Using Stripe Key: ${stripeKey.substring(0, 8)}...`);

    try {
        // 1. Verify Balance (Simple read test)
        console.log('Verifying connection...');
        const balance = await stripe.balance.retrieve();
        console.log('✅ Connection Successful!');
        console.log('   Available Balance:', balance.available);

        // 2. List Products
        console.log('\nFetching Product Catalogue...');
        const products = await stripe.products.list({ limit: 10, active: true, expand: ['data.default_price'] });

        if (products.data.length === 0) {
            console.log('⚠️  No active products found. You may need to create plans in the Stripe Dashboard.');
        } else {
            console.log(`✅ Found ${products.data.length} active products:`);
            products.data.forEach(p => {
                const price = p.default_price as Stripe.Price | null;
                const priceString = price
                    ? `${(price.unit_amount || 0) / 100} ${price.currency.toUpperCase()}`
                    : 'No default price';
                console.log(`   - [${p.name}] (ID: ${p.id}) - ${priceString} (Price ID: ${price?.id || 'N/A'})`);
            });
        }

    } catch (error: any) {
        console.error('\n❌ Stripe Verification Failed:');
        console.error('   Error Code:', error.code);
        console.error('   Message:', error.message);
        if (error.code === 'resource_missing' && error.message.includes('No such API key')) {
            console.error('   -> The API key "mk_..." appears to be invalid or unassociated with an account.');
        }
    }
}

verifyStripe();
