
import { SubscriptionRepository } from '../src/lib/neo4j/subscription-repository';
import { getDriver, closeDriver } from '../src/lib/neo4j/driver';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

async function verifyBilling() {
    console.log('Starting Billing Verification...');

    // Initialize driver (implicitly done by getDriver if env vars are set)
    // We need to make sure we have a driver instance
    const driver = getDriver();
    if (!driver) {
        console.error('Failed to initialize Neo4j driver. Check .env');
        process.exit(1);
    }

    const repo = new SubscriptionRepository();
    const accountId = 'verify-billing-test-account-' + Date.now();

    try {
        const session = driver.session();

        // 1. Setup: Create a test account
        console.log(`\n1. Creating test account: ${accountId}`);
        await session.run(`
            CREATE (a:Account {id: $accountId, name: 'Billing Test Account'})
            RETURN a
        `, { accountId });
        console.log('   ✅ Account created');

        // 2. Verify Credits
        console.log('\n2. Verifying Add Credit...');
        await repo.addCredit(accountId, 50, 'Test Credit');

        const creditCheck = await session.run(`
            MATCH (a:Account {id: $accountId})-[:HAS_CREDIT]->(c:Credit)
            RETURN c.amount as amount, c.note as note
        `, { accountId });

        const credit = creditCheck.records[0]?.toObject();
        if (credit && credit.amount === 50 && credit.note === 'Test Credit') {
            console.log('   ✅ Credit added and verified');
        } else {
            console.error('   ❌ Credit verification failed', credit);
        }

        // 3. Verify Invoices & Refunds
        console.log('\n3. Verifying Invoice Refund...');
        // Create mock invoice directly (since we don't have an API for it, but repo has method)
        await repo.createMockInvoice(accountId, 99, 'PAID');

        const invoicesBefore = await repo.getInvoiceHistory(accountId);
        const invoiceId = invoicesBefore[0].id;
        console.log(`   Created invoice ${invoiceId} with status ${invoicesBefore[0].status}`);

        // Refund it
        await repo.refundInvoice(invoiceId);

        const invoicesAfter = await repo.getInvoiceHistory(accountId);
        const refundedInvoice = invoicesAfter.find(i => i.id === invoiceId);

        if (refundedInvoice && refundedInvoice.status === 'REFUNDED') {
            console.log('   ✅ Invoice refunded successfully');
        } else {
            console.error('   ❌ Refund verification failed', refundedInvoice);
        }

        // 4. Verify LTD Redemption
        console.log('\n4. Verifying LTD Redemption...');
        const code = 'LTD-TEST-' + Date.now();
        const redeemSuccess = await repo.redeemLTDCode(accountId, code);

        if (redeemSuccess) {
            console.log('   ✅ LTD Code redeemed successfully');
        } else {
            console.error('   ❌ LTD Redemption failed');
        }

        // Verify double redemption prevention
        const redeemAgain = await repo.redeemLTDCode(accountId, code);
        if (!redeemAgain) {
            console.log('   ✅ Double redemption prevented');
        } else {
            console.error('   ❌ Double redemption check failed');
        }

        // Cleanup
        console.log('\nCleaning up...');
        await session.run(`MATCH (a:Account {id: $accountId}) DETACH DELETE a`, { accountId });
        await session.close();

    } catch (error) {
        console.error('Verification failed:', error);
    } finally {
        await closeDriver();
    }
}

verifyBilling();
