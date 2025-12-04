import { NextRequest, NextResponse } from 'next/server';
import { createTemporalClient } from '@/lib/temporal';
import { ClickHouseBacklinkRepository } from '@/lib/clickhouse/repositories/ClickHouseBacklinkRepository';
import { DataForSEOClient } from '@/lib/dataforseo';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '100');

    try {
        // Fetch data from ClickHouse
        const [stats, backlinks, referringDomains] = await Promise.all([
            ClickHouseBacklinkRepository.getStats(id),
            ClickHouseBacklinkRepository.getBacklinks(id, limit),
            ClickHouseBacklinkRepository.getReferringDomains(id)
        ]);

        return NextResponse.json({
            stats: stats || {
                total_domains: 0,
                total_backlinks: 0,
                dofollow_count: 0,
                avg_relevance: 0,
                avg_spam_score: 0
            },
            backlinks,
            referringDomains
        });
    } catch (error) {
        console.error('Failed to fetch backlink data:', error);
        return NextResponse.json({ error: 'Failed to fetch backlink data' }, { status: 500 });
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const client = await createTemporalClient();
        if (!client) {
            throw new Error('Failed to connect to Temporal');
        }
        const handle = await client.workflow.start('BacklinkIndexWorkflow', {
            taskQueue: 'seo-tasks-queue',
            workflowId: `backlink-index-${id}-${Date.now()}`,
            args: [{ siteId: id, limit: 50 }], // Default limit
        });

        return NextResponse.json({
            success: true,
            workflowId: handle.workflowId,
            message: 'Backlink indexing started'
        });
    } catch (error) {
        console.error('Failed to trigger backlink indexing:', error);
        return NextResponse.json({ error: 'Failed to trigger indexing' }, { status: 500 });
    }
}
