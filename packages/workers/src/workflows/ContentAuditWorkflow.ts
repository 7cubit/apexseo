import { proxyActivities, patched } from '@temporalio/workflow';
import type * as activities from '../activities';

const { calculateContentScore } = proxyActivities<typeof activities>({
    startToCloseTimeout: '5m',
});

export interface ContentAuditWorkflowInput {
    siteId: string;
    pageId: string;
    keyword: string;
}

export async function ContentAuditWorkflow(input: ContentAuditWorkflowInput): Promise<void> {
    await calculateContentScore({
        siteId: input.siteId,
        pageId: input.pageId,
        keyword: input.keyword,
    });

    // Versioning Example: Add cleanup step for v2
    if (patched('v2')) {
        // await cleanupAuditResources({ pageId: input.pageId });
        console.log('Cleanup resources for v2');
    }
}
