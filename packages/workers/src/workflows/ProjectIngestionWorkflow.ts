import { proxyActivities, executeChild, defineSignal, setHandler, defineQuery } from '@temporalio/workflow';
import { SiteCrawlWorkflow } from './SiteCrawlWorkflow';
import { SERPAnalysisWorkflow } from './SERPAnalysisWorkflow';
import { EmbeddingGenerationWorkflow } from './EmbeddingGenerationWorkflow';
import * as activities from '../activities';

// Define activities proxy
const { fetchRobotsAndSitemap, updateProjectStatus, scheduleRecrawl } = proxyActivities({
    startToCloseTimeout: '5 minutes',
});

export interface ProjectIngestionInput {
    projectId: string;
    domain: string;
    userId: string;
}

export interface ProjectIngestionOutput {
    status: 'completed' | 'failed';
    pagesCrawled: number;
    initialScore: number;
}

// Signals & Queries
export const cancelIngestionSignal = defineSignal('cancelIngestion');
export const ingestionProgressQuery = defineQuery<IngestionProgress>('ingestionProgress');

interface IngestionProgress {
    step: string;
    pagesCrawled: number;
    totalSteps: number;
    currentStepIndex: number;
}

export async function ProjectIngestionWorkflow(input: ProjectIngestionInput): Promise<ProjectIngestionOutput> {
    const { projectId, domain } = input;
    let isCancelled = false;
    let progress: IngestionProgress = { step: 'Initializing', pagesCrawled: 0, totalSteps: 5, currentStepIndex: 0 };
    const compensations: (() => Promise<void>)[] = [];

    setHandler(cancelIngestionSignal, () => {
        isCancelled = true;
    });

    setHandler(ingestionProgressQuery, () => progress);

    try {
        if (isCancelled) throw new Error('Ingestion cancelled');

        // 1. Validate Domain & Fetch Sitemap
        progress = { ...progress, step: 'Fetching Sitemap', currentStepIndex: 1 };
        const sitemap = await fetchRobotsAndSitemap({ domain });

        // 2. Initialize Project in DB
        progress = { ...progress, step: 'Initializing DB', currentStepIndex: 2 };
        await updateProjectStatus({ projectId, status: 'ingesting' });
        compensations.push(() => updateProjectStatus({ projectId, status: 'failed' }));

        // 3. Trigger Initial Crawl (Child Workflow)
        progress = { ...progress, step: 'Crawling Site', currentStepIndex: 3 };
        const crawlResult = await executeChild(SiteCrawlWorkflow, {
            args: [{ siteId: domain, startUrl: `https://${domain}`, maxDepth: 2 }],
            workflowId: `crawl-${projectId}-init`,
            retry: {
                initialInterval: '10 seconds',
                maximumInterval: '1 minute',
                maximumAttempts: 3,
            }
        });
        progress.pagesCrawled = crawlResult.pagesCrawled;

        // 4. Generate Embeddings & Clusters & SERP Analysis (Parallel)
        progress = { ...progress, step: 'Analyzing Content', currentStepIndex: 4 };
        await Promise.all([
            executeChild(EmbeddingGenerationWorkflow, { args: [{ projectId }] }),
            executeChild(SERPAnalysisWorkflow, { args: [{ projectId, keywords: ['brand'] }] })
        ]);

        // 5. Finalize
        progress = { ...progress, step: 'Finalizing', currentStepIndex: 5 };
        await updateProjectStatus({ projectId, status: 'active' });

        // 6. Schedule Recurring Recrawl
        await scheduleRecrawl({ projectId, cron: '0 0 * * 0' }); // Weekly

        return { status: 'completed', pagesCrawled: crawlResult.pagesCrawled, initialScore: 0 };

    } catch (error) {
        // Compensate
        for (const compensation of compensations.reverse()) {
            await compensation().catch(err => console.error('Compensation failed', err));
        }

        if (isCancelled) {
            return { status: 'failed', pagesCrawled: 0, initialScore: 0 };
        }
        throw error;
    }
}
