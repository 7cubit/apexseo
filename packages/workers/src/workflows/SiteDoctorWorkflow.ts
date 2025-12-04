import { proxyActivities, log } from '@temporalio/workflow';
import type * as activities from '../activities/site-doctor'; // Assuming we have these or will create
import type * as scoringActivities from '../activities/scoring';

const { fetchPriorityPages, reCrawlPage } = proxyActivities<typeof activities>({
    startToCloseTimeout: '10 minutes',
});

const { calculateCompositeScore } = proxyActivities<typeof scoringActivities>({
    startToCloseTimeout: '1 minute',
});

export async function SiteDoctorWorkflow(): Promise<void> {
    log.info('SiteDoctorWorkflow started');

    // 1. Fetch pages that need attention (e.g., high priority, old crawl date)
    // We might need an activity to fetch all projects first, then iterate.
    // For MVP, let's assume we fetch a batch of pages across all projects or per project.
    // Let's assume we iterate projects.

    // Actually, simpler: Fetch pages sorted by last_crawled_at ASC limit 100
    const pagesToCrawl = await fetchPriorityPages();
    log.info(`Found ${pagesToCrawl.length} pages to re-crawl`);

    for (const page of pagesToCrawl) {
        try {
            // 2. Re-crawl
            const crawlResult = await reCrawlPage(page.url);

            // 3. Re-score
            await calculateCompositeScore(page.url);

            log.info(`Processed page ${page.url}`);
        } catch (error) {
            log.error(`Failed to process page ${page.url}`, { error });
            // Continue to next page
        }
    }

    log.info('SiteDoctorWorkflow completed');
}
