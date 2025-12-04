import { NextResponse } from 'next/server';
import { SubscriptionRepository } from '@apexseo/shared';

const subRepo = new SubscriptionRepository();

export async function GET() {
    try {
        const plans = await subRepo.listPlans();
        return NextResponse.json({ plans });
    } catch (error) {
        console.error('Error fetching plans:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        // TODO: Validate body against Plan interface
        // TODO: Check for SUPER_ADMIN role

        const plan = await subRepo.createPlan(body);
        return NextResponse.json({ plan });
    } catch (error) {
        console.error('Error creating plan:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
