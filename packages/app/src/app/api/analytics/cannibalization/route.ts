import { NextResponse } from 'next/server';
import { CannibalizationService } from '@/lib/cannibalization';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get('siteId');

    if (!siteId) {
        return NextResponse.json({ error: 'siteId is required' }, { status: 400 });
    }

    try {
        const issues = await CannibalizationService.analyze(siteId);
        return NextResponse.json(issues);
    } catch (error) {
        console.error('Error fetching cannibalization issues:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
