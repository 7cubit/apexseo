import { NextResponse } from 'next/server';
import { SubscriptionRepository, AuditLogRepository } from '@apexseo/shared';

const subRepo = new SubscriptionRepository();
const auditRepo = new AuditLogRepository();

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { accountId, code, admin_id } = body;

        if (!accountId || !code) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const success = await subRepo.redeemLTDCode(accountId, code);

        if (!success) {
            return NextResponse.json({ error: 'Invalid or used code' }, { status: 400 });
        }

        if (admin_id) {
            await auditRepo.create({
                admin_id,
                action: 'REDEEM_LTD',
                entity_type: 'ACCOUNT',
                entity_id: accountId,
                details: JSON.stringify({ code }),
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error redeeming code:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
