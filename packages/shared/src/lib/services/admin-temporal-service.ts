import { createTemporalClient } from '../temporal';

export class AdminTemporalService {
    static async triggerCrawl(projectId: string, url: string, depth: number = 2) {
        const client = await createTemporalClient();
        if (!client) throw new Error('Temporal client not available');

        const handle = await client.workflow.start('CrawlWorkflow', {
            taskQueue: 'crawler-queue',
            workflowId: `crawl-${projectId}-${Date.now()}`,
            args: [{ projectId, url, depth }],
        });

        return handle.workflowId;
    }

    static async pauseCrawl(workflowId: string) {
        const client = await createTemporalClient();
        if (!client) throw new Error('Temporal client not available');

        const handle = client.workflow.getHandle(workflowId);
        await handle.signal('pause');
    }

    static async resumeCrawl(workflowId: string) {
        const client = await createTemporalClient();
        if (!client) throw new Error('Temporal client not available');

        const handle = client.workflow.getHandle(workflowId);
        await handle.signal('resume');
    }

    static async terminateCrawl(workflowId: string, reason: string = 'Admin termination') {
        const client = await createTemporalClient();
        if (!client) throw new Error('Temporal client not available');

        const handle = client.workflow.getHandle(workflowId);
        await handle.terminate(reason);
    }

    static async getWorkflowStatus(workflowId: string) {
        const client = await createTemporalClient();
        if (!client) return 'UNKNOWN';

        try {
            const handle = client.workflow.getHandle(workflowId);
            const description = await handle.describe();
            return description.status.name;
        } catch (e) {
            return 'NOT_FOUND';
        }
    }
}
