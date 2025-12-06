import { Connection, Client } from '@temporalio/client';
import { HexagonClickGapFillWorkflow } from './workflow';
import { GapFillWorkflowInput, GapFillWorkflowOutput } from './types';

export async function triggerGapFillWorkflow(
    input: GapFillWorkflowInput
): Promise<string> {
    const connection = await Connection.connect({ address: 'localhost:7233' });
    const client = new Client({
        connection,
        // namespace: 'default', // defaults to 'default'
    });

    const handle = await client.workflow.start(HexagonClickGapFillWorkflow, {
        taskQueue: 'gap-fill-queue',
        args: [input],
        workflowId: `gap-fill-${input.cluster_id}-${Date.now()}`,
    });

    return handle.workflowId;
}

export async function getGapFillWorkflowResult(workflowId: string): Promise<GapFillWorkflowOutput> {
    const connection = await Connection.connect({ address: 'localhost:7233' });
    const client = new Client({ connection });
    const handle = client.workflow.getHandle(workflowId);
    return await handle.result() as GapFillWorkflowOutput;
}
