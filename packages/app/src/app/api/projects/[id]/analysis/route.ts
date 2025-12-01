import { NextResponse } from 'next/server';
import { Client } from '@temporalio/client';

export async function POST(request: Request, { params }: { params: { id: string } }) {
    const projectId = params.id;

    try {
        const client = new Client({
            connection: await { address: process.env.TEMPORAL_ADDRESS || 'localhost:7233' } as any // Fix connection type if needed
        });

        const handle = await client.workflow.start('AnalysisWorkflow', {
            taskQueue: 'seo-tasks-queue',
            workflowId: `analysis-${projectId}-${Date.now()}`,
            args: [projectId],
        });

        return NextResponse.json({ workflowId: handle.workflowId, status: 'started' });
    } catch (error) {
        console.error('Error triggering analysis:', error);
        return NextResponse.json({ error: 'Failed to trigger analysis' }, { status: 500 });
    }
}
