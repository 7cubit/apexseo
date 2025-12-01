"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resumeSignal = exports.pauseSignal = void 0;
exports.SiteCrawlWorkflow = SiteCrawlWorkflow;
const workflow_1 = require("@temporalio/workflow");
const { fetch_html } = (0, workflow_1.proxyActivities)({
    startToCloseTimeout: '1 minute',
    taskQueue: 'seo-tasks-queue', // Same queue for now, or separate if needed
});
const { parseHtml: parseHtmlActivity, persistData: persistDataActivity } = (0, workflow_1.proxyActivities)({
    startToCloseTimeout: '1 minute',
});
// Signals
exports.pauseSignal = (0, workflow_1.defineSignal)('pause');
exports.resumeSignal = (0, workflow_1.defineSignal)('resume');
async function SiteCrawlWorkflow(args) {
    const { siteId, startUrl, maxDepth = 2, limit = 100 } = args;
    let isPaused = false;
    (0, workflow_1.setHandler)(exports.pauseSignal, () => void (isPaused = true));
    (0, workflow_1.setHandler)(exports.resumeSignal, () => void (isPaused = false));
    const visited = new Set();
    const queue = [{ url: startUrl, depth: 0 }];
    let processedCount = 0;
    while (queue.length > 0 && processedCount < limit) {
        await (0, workflow_1.condition)(() => !isPaused);
        const { url, depth } = queue.shift();
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
        }
        catch (error) {
            console.error(`Failed to process ${url}:`, error);
        }
    }
}
