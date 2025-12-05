import { NextResponse } from 'next/server';
import { VolatilityService } from '@/lib/volatility-service';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get('siteId');

    if (!siteId) {
        return NextResponse.json({ error: 'siteId is required' }, { status: 400 });
    }

    try {
        const report = await VolatilityService.getReport(siteId);
        return NextResponse.json(report);
    } catch (error) {
        console.error('Error fetching volatility report:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
