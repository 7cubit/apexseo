import { prisma, InvoiceStatus } from '@apexseo/database';
import { stripe } from '../lib/stripe';

export class RefundService {
    async createRefund(invoiceId: string, amount?: number, reason?: string) {
        // 1. Fetch Invoice
        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: { user: true }
        });

        if (!invoice) {
            throw new Error('Invoice not found');
        }

        if (invoice.status !== InvoiceStatus.PAID) {
            throw new Error('Cannot refund an unpaid invoice');
        }

        // 2. Validate Timeframe (< 90 days)
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        if (invoice.createdAt < ninetyDaysAgo) {
            throw new Error('Refunds are only allowed within 90 days of purchase');
        }

        // 3. Process with Stripe
        // Invoice ID in our DB is the Stripe Invoice ID (e.g., in_123)
        // Refunds usually need a Charge ID or PaymentIntent ID.
        // We need to fetch the invoice from Stripe to get the charge ID.
        const stripeInvoice = await stripe.invoices.retrieve(invoiceId);

        if (!(stripeInvoice as any).charge) {
            throw new Error('No charge associated with this invoice');
        }

        const refundParams: any = {
            charge: (stripeInvoice as any).charge as string,
            reason: 'requested_by_customer', // Default reason for api
        };

        if (amount) {
            refundParams.amount = Math.round(amount * 100); // dollars to cents
        }

        // Add metadata for tracking
        refundParams.metadata = {
            reason_note: reason || 'Admin initiated'
        };

        const refund = await stripe.refunds.create(refundParams);

        // 4. Update Database
        await prisma.refund.create({
            data: {
                id: refund.id,
                invoiceId: invoice.id,
                amount: amount || Number(invoice.amountPaid),
                reason: reason
            }
        });

        return refund;
    }
}
