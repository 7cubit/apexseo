import { proxyActivities, log } from '@temporalio/workflow';
import type * as activities from '../activities/rank-tracker'; // Need to create this

const { fetchTrackedKeywords, checkRankings, saveRankings } = proxyActivities<typeof activities>({
    startToCloseTimeout: '30 minutes', // API calls might take time
});

export async function RankTrackerWorkflow(): Promise<void> {
    log.info('RankTrackerWorkflow started');

    // 1. Fetch all tracked keywords
    const keywords = await fetchTrackedKeywords();
    log.info(`Found ${keywords.length} keywords to track`);

    if (keywords.length === 0) {
        return;
    }

    // 2. Check rankings (batch processing recommended)
    // For MVP, we pass all keywords. In production, we'd batch or iterate.
    const rankings = await checkRankings(keywords);

    // 3. Save history
    await saveRankings(rankings);

    log.info('RankTrackerWorkflow completed');
}
