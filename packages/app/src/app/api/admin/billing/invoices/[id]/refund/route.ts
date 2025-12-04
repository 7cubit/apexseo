import { NextResponse } from 'next/server';
import { SubscriptionRepository, AuditLogRepository } from '@apexseo/shared';

const subRepo = new SubscriptionRepository();
const auditRepo = new AuditLogRepository();

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const { admin_id } = body;

        await subRepo.refundInvoice(params.id);

        if (admin_id) {
            await auditRepo.create({
                admin_id,
                action: 'REFUND_INVOICE',
                entity_type: 'INVOICE',
                entity_id: params.id,
                details: JSON.stringify({ status: 'REFUNDED' }),
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error refunding invoice:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
