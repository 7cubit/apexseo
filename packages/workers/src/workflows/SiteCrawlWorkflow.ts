import { proxyActivities, defineSignal, setHandler, condition, sleep } from '@temporalio/workflow';
import * as activities from '../activities';

// Node.js Activities (Persistence)
const { writePageToClickHouse, updateGraphInNeo4j } = proxyActivities<typeof activities>({
    startToCloseTimeout: '1 minute',
    retry: {
        initialInterval: '1 second',
        maximumInterval: '1 minute',
        backoffCoefficient: 2,
        maximumAttempts: 5,
    }
});

// Python Activities (Crawling)
// We need to define the interface since we can't import Python types
interface PythonActivities {
    fetch_html(url: string): Promise<any>;
    parse_html(html: string, url: string): Promise<any>;
    fetch_robots_txt(domain: string): Promise<string>;
    can_fetch(url: string, robots_content: string): Promise<boolean>;
}

const { fetch_html, parse_html, fetch_robots_txt, can_fetch } = proxyActivities<PythonActivities>({
    taskQueue: 'seo-python-worker-task-queue',
    startToCloseTimeout: '2 minutes',
    retry: {
        initialInterval: '1 second',
        maximumInterval: '1 minute',
        backoffCoefficient: 2,
        maximumAttempts: 3,
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

    // 1. Fetch Robots.txt
    let robotsContent = "";
    try {
        const domain = new URL(startUrl).origin;
        robotsContent = await fetch_robots_txt(domain);
    } catch (e) {
        console.warn("Failed to fetch robots.txt, proceeding without it.");
    }

    const visited = new Set<string>();
    const queue: { url: string; depth: number }[] = [{ url: startUrl, depth: 0 }];

    while (queue.length > 0 && pagesCrawled < limit) {
        await condition(() => !isPaused);

        const { url, depth } = queue.shift()!;

        if (visited.has(url) || depth > maxDepth) {
            continue;
        }

        // 2. Check Robots.txt
        const allowed = await can_fetch(url, robotsContent);
        if (!allowed) {
            console.log(`Skipping ${url} due to robots.txt`);
            continue;
        }

        visited.add(url);
        pagesCrawled++;

        try {
            // 3. Rate Limiting (1s delay)
            await sleep(1000);

            // 4. Fetch HTML (Python)
            const fetchResult = await fetch_html(url);

            if (fetchResult && fetchResult.status === 200) {
                // 5. Parse HTML (Python)
                const parsedData = await parse_html(fetchResult.html, url);

                // 6. Write to ClickHouse (Node.js)
                // Map Python output to expected Node.js input
                const pageData = {
                    ...parsedData,
                    status: '200', // Normalize status
                    content: parsedData.text, // Map text to content
                    internalLinks: parsedData.links.filter((l: any) => l.isInternal),
                    externalLinks: parsedData.links.filter((l: any) => !l.isInternal)
                };

                await writePageToClickHouse({ ...pageData, siteId });

                // 7. Update Neo4j Graph (Node.js)
                await updateGraphInNeo4j({ ...pageData, siteId });

                // 8. Enqueue Links
                for (const link of parsedData.links) {
                    if (link.isInternal && !visited.has(link.url)) {
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
