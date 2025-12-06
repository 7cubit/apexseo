import { NextResponse } from 'next/server';
import { triggerGapFillWorkflow } from '@/workflows/gap-fill/client';
import { GapFillWorkflowInput } from '@/workflows/gap-fill/types';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { cluster_id, topic_id, my_domain, top_competitor, user_id } = body;

        if (!cluster_id || !topic_id || !my_domain || !top_competitor) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const input: GapFillWorkflowInput = {
            cluster_id,
            topic_id,
            my_domain,
            top_competitor_domain: top_competitor,
            user_id: user_id || 'anonymous' // Fallback or require auth
        };

        const workflowId = await triggerGapFillWorkflow(input);

        return NextResponse.json({
            taskId: workflowId,
            status: 'STARTED',
            message: `Workflow started for cluster ${cluster_id}`
        });

    } catch (error) {
        console.error('Failed to trigger workflow:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
