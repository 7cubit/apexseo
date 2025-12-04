import { NextResponse } from 'next/server';
import { ClickHouseUsageRepository } from '@apexseo/shared';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get('days') || '30');

        const stats = await ClickHouseUsageRepository.getGlobalStats(days);
        const topEndpoints = await ClickHouseUsageRepository.getTopEndpoints(undefined, 10);

        return NextResponse.json({ stats, topEndpoints });
    } catch (error) {
        console.error('Error fetching global usage:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
