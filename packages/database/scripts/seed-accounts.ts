import { config } from 'dotenv';
import path from 'path';

// Load environment variables from the root .env file
config({ path: path.resolve(process.cwd(), '../../.env') });

import { AccountRepository, SubscriptionRepository, UserRepository } from '@apexseo/shared';

const accountRepo = new AccountRepository();
const subRepo = new SubscriptionRepository();
const userRepo = new UserRepository();

async function seed() {
    console.log('Seeding accounts and subscriptions...');

    try {
        // 1. Create Plans
        const plans = [
            { name: 'Starter', price: 29, currency: 'USD', features: ['5 Projects', '10k Pages'] },
            { name: 'Pro', price: 79, currency: 'USD', features: ['15 Projects', '50k Pages'] },
            { name: 'Agency', price: 199, currency: 'USD', features: ['Unlimited Projects', '200k Pages'] }
        ];

        const createdPlans = [];
        for (const plan of plans) {
            const p = await subRepo.createPlan(plan);
            createdPlans.push(p);
            console.log(`Created plan: ${p.name}`);
        }

        // 2. Create Account for existing customer
        const customerEmail = 'customer@apexseo.co';
        const customer = await userRepo.findByEmail(customerEmail);

        if (customer) {
            const account = await accountRepo.create('ApexSEO Demo Account');
            console.log(`Created account: ${account.name}`);

            await accountRepo.addUserToAccount(customer.id, account.id, 'OWNER');
            console.log(`Added user ${customerEmail} to account`);

            // 3. Subscribe to Pro Plan
            const proPlan = createdPlans.find(p => p.name === 'Pro');
            if (proPlan) {
                await subRepo.subscribe(account.id, proPlan.id);
                console.log(`Subscribed account to ${proPlan.name} plan`);
            }
        } else {
            console.warn(`User ${customerEmail} not found. Skipping account creation.`);
        }

        console.log('Seeding completed successfully.');
    } catch (error) {
        console.error('Seeding failed:', error);
    }
}

seed();
