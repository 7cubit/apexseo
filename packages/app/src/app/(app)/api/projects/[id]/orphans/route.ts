import { NextRequest, NextResponse } from 'next/server';
import { ClickHousePageRepository } from '@apexseo/shared';
import { Connection, WorkflowClient } from '@temporalio/client';

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const { id } = params;
    try {
        const connection = await Connection.connect({ address: process.env.TEMPORAL_ADDRESS || 'localhost:7233' });
        const client = new WorkflowClient({ connection });

        // We can trigger a workflow or just run the activity logic if we had a workflow for it.
        // Since we only have an activity, we should probably wrap it in a workflow or just call the logic if possible?
        // But activities run in workers.
        // Let's assume we have a workflow 'OrphanDetectionWorkflow' or we add it to SiteCrawlWorkflow.
        // For now, let's just return a placeholder or trigger a generic workflow if exists.
        // Actually, the plan implied a standalone detection.
        // Let's assume we trigger 'OrphanDetectionWorkflow' (which I need to create or add to workflows.ts).

        // For MVP, I'll just return success and say "Not implemented yet" or create the workflow.
        // I'll create a simple workflow in the next step.

        const handle = await client.start('OrphanDetectionWorkflow', {
            args: [id],
            taskQueue: 'seo-tasks-queue',
            workflowId: `orphan-detection-${id}-${Date.now()}`,
        });

        return NextResponse.json({ success: true, workflowId: handle.workflowId });
    } catch (error) {
        console.error('Error triggering orphan detection:', error);
        return NextResponse.json({ error: 'Failed to trigger detection' }, { status: 500 });
    }
}

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const { id } = params;
    try {
        const orphans = await ClickHousePageRepository.getOrphanPages(id);
        return NextResponse.json({ orphans });
    } catch (error) {
        console.error('Error fetching orphans:', error);
        return NextResponse.json({ error: 'Failed to fetch orphans' }, { status: 500 });
    }
}
