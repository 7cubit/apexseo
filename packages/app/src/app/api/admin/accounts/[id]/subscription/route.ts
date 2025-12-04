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
        const { planId, admin_id } = body;

        if (!planId) {
            return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 });
        }

        const subscription = await subRepo.changePlan(params.id, planId);

        if (admin_id) {
            await auditRepo.create({
                admin_id,
                action: 'CHANGE_PLAN',
                entity_type: 'ACCOUNT',
                entity_id: params.id,
                details: JSON.stringify({ planId, subscriptionId: subscription.id }),
            });
        }

        return NextResponse.json({ subscription });
    } catch (error) {
        console.error('Error changing plan:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { searchParams } = new URL(request.url);
        const subscriptionId = searchParams.get('subscriptionId');
        const admin_id = searchParams.get('admin_id');

        if (!subscriptionId) {
            return NextResponse.json({ error: 'Subscription ID is required' }, { status: 400 });
        }

        const subscription = await subRepo.cancel(subscriptionId);

        if (admin_id) {
            await auditRepo.create({
                admin_id: admin_id,
                action: 'CANCEL_SUBSCRIPTION',
                entity_type: 'SUBSCRIPTION',
                entity_id: subscriptionId,
                details: JSON.stringify({ accountId: params.id }),
            });
        }

        return NextResponse.json({ subscription });
    } catch (error) {
        console.error('Error cancelling subscription:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
