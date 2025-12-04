import { NextResponse } from 'next/server';
import { SubscriptionRepository, AuditLogRepository } from '@apexseo/shared';

const subRepo = new SubscriptionRepository();
const auditRepo = new AuditLogRepository();

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { accountId, amount, note, admin_id } = body;

        if (!accountId || !amount || !note) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await subRepo.addCredit(accountId, amount, note);

        if (admin_id) {
            await auditRepo.create({
                admin_id,
                action: 'ADD_CREDIT',
                entity_type: 'ACCOUNT',
                entity_id: accountId,
                details: JSON.stringify({ amount, note }),
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error adding credit:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
