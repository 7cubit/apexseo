import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities/project-setup';

const { createProjectGraph, initializeAnalytics } = proxyActivities<typeof activities>({
    startToCloseTimeout: '1 minute',
});

export interface ProjectSetupWorkflowArgs {
    projectId: string;
    projectName: string;
    siteUrl: string;
    keywords: string[];
    competitors: string[];
}

export async function ProjectSetupWorkflow(args: ProjectSetupWorkflowArgs): Promise<void> {
    // 1. Create Graph Entities
    await createProjectGraph(args);

    // 2. Initialize Analytics (Parallelizable in future)
    await initializeAnalytics(args);

    // 3. Trigger initial crawl (Child workflow pattern)
    // const siteId = new URL(args.siteUrl).hostname;
    // await executeChild(SiteCrawlWorkflow, { ... });
}
