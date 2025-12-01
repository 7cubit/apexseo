import { proxyActivities, defineSignal, setHandler, condition } from '@temporalio/workflow';
import * as activities from './activities';
import { parseHtml, persistData } from './activities'; // Local TS activities

// Define Python activities interface
interface PythonActivities {
    fetch_html(url: string): Promise<{
        url: string;
        status: number;
        html: string;
        headers: Record<string, string>;
    }>;
}

const { fetch_html } = proxyActivities<PythonActivities>({
    startToCloseTimeout: '1 minute',
    taskQueue: 'seo-tasks-queue', // Same queue for now, or separate if needed
});

export async function BacklinkIndexWorkflow(projectId: string): Promise<void> {
    const { fetchBacklinksActivity, processBacklinksActivity, storeBacklinksActivity } = proxyActivities<typeof activities>({
        startToCloseTimeout: '10m',
    });
    const backlinks = await fetchBacklinksActivity(projectId);
    await processBacklinksActivity(projectId, backlinks);
    await storeBacklinksActivity(projectId, backlinks);
}

export async function AnalysisWorkflow(projectId: string): Promise<void> {
    const { runTSPRActivity, runClusteringActivity, calculateHealthScoresActivity } = proxyActivities<typeof activities>({
        startToCloseTimeout: '30m',
    });

    // 1. Run TSPR (Graph Algorithm)
    await runTSPRActivity(projectId);

    // 2. Run Clustering (ML)
    await runClusteringActivity(projectId);

    // 3. Calculate Composite Health Scores (uses results from above + other scorers)
    await calculateHealthScoresActivity(projectId);
}

export async function OrphanDetectionWorkflow(siteId: string): Promise<void> {
    const { detectOrphanPagesActivity } = proxyActivities<typeof activities>({
        startToCloseTimeout: '10m',
    });
    await detectOrphanPagesActivity(siteId);
}

const { parseHtml: parseHtmlActivity, persistData: persistDataActivity } = proxyActivities({
    startToCloseTimeout: '1 minute',
});

// Signals
export const pauseSignal = defineSignal('pause');
export const resumeSignal = defineSignal('resume');

export async function SiteCrawlWorkflow(args: { siteId: string; startUrl: string; maxDepth?: number; limit?: number }): Promise<void> {
    const { siteId, startUrl, maxDepth = 2, limit = 100 } = args;

    let isPaused = false;
    setHandler(pauseSignal, () => void (isPaused = true));
    setHandler(resumeSignal, () => void (isPaused = false));

    const visited = new Set<string>();
    const queue: { url: string; depth: number }[] = [{ url: startUrl, depth: 0 }];
    let processedCount = 0;

    while (queue.length > 0 && processedCount < limit) {
        await condition(() => !isPaused);

        const { url, depth } = queue.shift()!;

        if (visited.has(url) || depth > maxDepth) {
            continue;
        }

        visited.add(url);
        processedCount++;

        try {
            // 1. Fetch HTML (Python)
            const fetchResult = await fetch_html(url);

            if (fetchResult.status === 200) {
                // 2. Parse HTML (TS)
                const parsed = await parseHtmlActivity(fetchResult.html, url);

                // 3. Persist Data (TS)
                await persistDataActivity({ ...parsed, siteId });

                // 4. Enqueue links
                for (const link of parsed.links) {
                    if (!visited.has(link)) {
                        queue.push({ url: link, depth: depth + 1 });
                    }
                }
            }
        } catch (error) {
            console.error(`Failed to process ${url}: `, error);
        }
    }
}

export * from './workflows/LinkOptimizerWorkflow';
export * from './workflows/SiteDoctorWorkflow';
export * from './workflows/RankTrackerWorkflow';

export async function ScoreRefreshWorkflow(siteId: string): Promise<void> {
    const { calculateHealthScoresActivity } = proxyActivities<typeof activities>({
        startToCloseTimeout: '10 minutes',
    });
    await calculateHealthScoresActivity(siteId);
}
