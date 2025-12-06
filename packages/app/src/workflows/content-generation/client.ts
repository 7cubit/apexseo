import { Client } from '@temporalio/client';
import { contentGenerationWorkflow } from './workflow';
import { EEATRequest } from './types';

export async function triggerContentGeneration(input: EEATRequest): Promise<string> {
    const client = new Client(); // Assumes local Temporal server or env vars set

    const handle = await client.workflow.start(contentGenerationWorkflow, {
        taskQueue: 'content-generation-queue',
        workflowId: `content-gen-${input.projectId}-${Date.now()}`,
        args: [input],
    });

    return handle.workflowId;
}
