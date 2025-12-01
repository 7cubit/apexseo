import { NextRequest, NextResponse } from 'next/server';
import { createTemporalClient } from '@/lib/temporal';
import { RankTrackingWorkflow, QUEUE_SEO_TASKS } from '@/temporal/workflows';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const body = await request.json();
    const { keywords, plan = 'Basic' } = body; // Default to Basic plan if not provided

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
        return NextResponse.json({ error: 'Keywords array is required' }, { status: 400 });
    }

    // Quota limits
    const quotas: Record<string, number> = {
        'Basic': 10,
        'Pro': 100,
        'Enterprise': 500
    };

    const limit = quotas[plan] || quotas['Basic'];

    if (keywords.length > limit) {
        return NextResponse.json({
            error: `Keyword limit exceeded for ${plan} plan. Limit is ${limit}.`
        }, { status: 403 });
    }

    const client = await createTemporalClient();
    if (!client) {
        return NextResponse.json({ error: 'Temporal client not available' }, { status: 503 });
    }

    try {
        const handle = await client.workflow.start(RankTrackingWorkflow, {
            taskQueue: QUEUE_SEO_TASKS,
            workflowId: `rank-tracking-${id}-${Date.now()}`,
            args: [{ siteId: id, keywords }],
        });

        // Estimate time: ~2 seconds per keyword (fetch + store)
        const estimatedSeconds = keywords.length * 2;
        const estimatedTime = estimatedSeconds > 60
            ? `${Math.ceil(estimatedSeconds / 60)}min`
            : `${estimatedSeconds}s`;

        return NextResponse.json({
            success: true,
            workflowId: handle.workflowId,
            estimatedTime,
            keywordsTracked: keywords.length,
            message: 'Rank tracking workflow started'
        });
    } catch (error) {
        console.error('Failed to start workflow:', error);
        return NextResponse.json({ error: 'Failed to start workflow' }, { status: 500 });
    }
}

