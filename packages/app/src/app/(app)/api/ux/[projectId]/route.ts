import { NextRequest, NextResponse } from 'next/server';
import { Connection, WorkflowClient } from '@temporalio/client';
import { SimulatePersonaSessionWorkflow } from '@/temporal/workflows';
import { QUEUE_UX_SIM } from '@/temporal/workflows';
import { ClickHouseUxSessionStore } from '@/lib/clickhouse/repositories/ClickHouseUxSessionStore';

export async function POST(
    req: NextRequest,
    { params }: { params: { projectId: string } }
) {
    const projectId = params.projectId;
    const body = await req.json();
    const { persona, goal, startUrl } = body;

    if (!persona || !goal) {
        return NextResponse.json({ error: "Missing persona or goal" }, { status: 400 });
    }

    try {
        if (!process.env.TEMPORAL_ADDRESS && !process.env.TEMPORAL_CLOUD_ADDRESS) {
            console.warn("Temporal not configured. Skipping simulation.");
            return NextResponse.json({ error: "Temporal not configured" }, { status: 503 });
        }

        const connection = await Connection.connect();
        const client = new WorkflowClient({ connection });

        const handle = await client.start(SimulatePersonaSessionWorkflow, {
            args: [{
                siteId: projectId,
                personaId: persona,
                goal: goal,
                startUrl: startUrl || 'home', // Default to home if not provided
                maxSteps: 10
            }],
            taskQueue: QUEUE_UX_SIM,
            workflowId: `ux-sim-${projectId}-${persona}-${Date.now()}`,
        });

        return NextResponse.json({ workflowId: handle.workflowId });
    } catch (error) {
        console.error("Failed to start UX simulation:", error);
        return NextResponse.json({ error: "Failed to start simulation" }, { status: 500 });
    }
}

export async function GET(
    req: NextRequest,
    { params }: { params: { projectId: string } }
) {
    const projectId = params.projectId;
    try {
        // Fetch aggregated metrics
        const metrics = await ClickHouseUxSessionStore.getMetrics(projectId);

        // Fetch recent sessions
        const sessions = await ClickHouseUxSessionStore.getSessionsBySite(projectId, 10);

        return NextResponse.json({ metrics, sessions });
    } catch (error) {
        console.error("Failed to fetch UX metrics:", error);
        return NextResponse.json({ error: "Failed to fetch metrics" }, { status: 500 });
    }
}
