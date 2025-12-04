import { NextResponse } from 'next/server';
import { SubscriptionRepository } from '@apexseo/shared';

const subRepo = new SubscriptionRepository();

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const accountId = searchParams.get('accountId');

        if (!accountId) {
            return NextResponse.json({ error: 'Account ID is required' }, { status: 400 });
        }

        const invoices = await subRepo.getInvoiceHistory(accountId);
        return NextResponse.json({ invoices });
    } catch (error) {
        console.error('Error fetching invoices:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
