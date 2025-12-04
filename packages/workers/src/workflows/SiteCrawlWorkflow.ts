import { proxyActivities, defineSignal, setHandler, condition } from '@temporalio/workflow';
import * as activities from '../activities';

const { crawlPage, writePageToClickHouse, updateGraphInNeo4j } = proxyActivities<typeof activities>({
    startToCloseTimeout: '5 minutes', // Increased for large pages
    retry: {
        initialInterval: '1 second',
        maximumInterval: '1 minute',
        backoffCoefficient: 2,
        maximumAttempts: 5,
    }
});

export interface SiteCrawlInput {
    siteId: string;
    startUrl: string;
    maxDepth?: number;
    limit?: number;
}

export interface SiteCrawlOutput {
    pagesCrawled: number;
}

export const pauseSignal = defineSignal('pause');
export const resumeSignal = defineSignal('resume');

export async function SiteCrawlWorkflow(input: SiteCrawlInput): Promise<SiteCrawlOutput> {
    const { siteId, startUrl, maxDepth = 2, limit = 100 } = input;
    let isPaused = false;
    let pagesCrawled = 0;

    setHandler(pauseSignal, () => void (isPaused = true));
    setHandler(resumeSignal, () => void (isPaused = false));

    const visited = new Set<string>();
    const queue: { url: string; depth: number }[] = [{ url: startUrl, depth: 0 }];

    while (queue.length > 0 && pagesCrawled < limit) {
        await condition(() => !isPaused);

        const { url, depth } = queue.shift()!;

        if (visited.has(url) || depth > maxDepth) {
            continue;
        }

        visited.add(url);
        pagesCrawled++;

        try {
            // 1. Crawl Page
            const pageData = await crawlPage(url);

            if (pageData) {
                // 2. Write to ClickHouse
                await writePageToClickHouse({ ...pageData, siteId });

                // 3. Update Neo4j Graph
                await updateGraphInNeo4j({ ...pageData, siteId });

                // 4. Enqueue Links
                for (const link of pageData.links) {
                    if (!visited.has(link.url)) {
                        queue.push({ url: link.url, depth: depth + 1 });
                    }
                }
            }
        } catch (error) {
            console.error(`Failed to process ${url}`, error);
        }
    }

    return { pagesCrawled };
}
