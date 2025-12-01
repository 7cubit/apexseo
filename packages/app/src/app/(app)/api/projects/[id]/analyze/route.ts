import { NextRequest, NextResponse } from 'next/server';
import { createTemporalClient } from '@/lib/temporal';
import { FullSiteAnalysisWorkflow, QUEUE_SEO_TASKS } from '@/temporal/workflows';

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const projectId = params.id;
    // In a real app, we'd fetch the site URL from the DB.
    // For now, we'll assume it's passed in the body or we look it up.
    // Let's look it up from Neo4j or just pass it in body for flexibility.
    const body = await req.json();
    const siteUrl = body.url || `https://${projectId}`; // Fallback

    try {
        console.log("Connecting to Temporal...");
        const client = await createTemporalClient();
        if (!client) {
            throw new Error("Failed to create Temporal client");
        }
        console.log("Connected to Temporal. Starting workflow...");
        const handle = await client.workflow.start(FullSiteAnalysisWorkflow, {
            taskQueue: QUEUE_SEO_TASKS,
            workflowId: `analysis-${projectId}-${Date.now()}`,
            args: [{ siteId: projectId, startUrl: siteUrl }],
        });
        console.log("Workflow started:", handle.workflowId);

        return NextResponse.json({ workflowId: handle.workflowId });
    } catch (error) {
        console.error("Failed to start workflow:", error);
        return NextResponse.json({ error: "Failed to start analysis", details: String(error) }, { status: 500 });
    }
}

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const projectId = params.id;
    const workflowId = req.nextUrl.searchParams.get('workflowId');

    if (!workflowId) {
        return NextResponse.json({ error: "Missing workflowId" }, { status: 400 });
    }

    try {
        const client = await createTemporalClient();
        if (!client) {
            throw new Error("Failed to create Temporal client");
        }
        const handle = client.workflow.getHandle(workflowId);

        // Query state
        const status = await handle.query('getStatus');
        const summary = await handle.query('getSummary');

        return NextResponse.json({ status, summary });
    } catch (error) {
        console.error("Failed to query workflow:", error);
        return NextResponse.json({ error: "Failed to get status", details: String(error) }, { status: 500 });
    }
}
