import { NextResponse } from 'next/server';
import { ClickHouseUsageRepository } from '@apexseo/shared';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get('days') || '30');

        const stats = await ClickHouseUsageRepository.getAccountStats(params.id, days);
        const topEndpoints = await ClickHouseUsageRepository.getTopEndpoints(params.id, 5);

        return NextResponse.json({ stats, topEndpoints });
    } catch (error) {
        console.error('Error fetching account usage:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
