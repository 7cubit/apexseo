import { NextRequest, NextResponse } from 'next/server';
import { CannibalizationService } from '@/lib/cannibalization';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const report = await CannibalizationService.analyze(id);
        return NextResponse.json({ report });
    } catch (error) {
        console.error('Failed to generate cannibalization report:', error);
        return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    // In the future, this could trigger a re-analysis or save to Neo4j
    // For now, we just return the analysis same as GET
    try {
        const report = await CannibalizationService.analyze(id);
        return NextResponse.json({ success: true, report });
    } catch (error) {
        console.error('Failed to trigger cannibalization analysis:', error);
        return NextResponse.json({ error: 'Failed to trigger analysis' }, { status: 500 });
    }
}
