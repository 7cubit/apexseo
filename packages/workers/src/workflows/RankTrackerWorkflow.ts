import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities';

const {
    fetchRankDataActivity,
    storeRankHistoryActivity,
    detectRankVolatilityActivity
} = proxyActivities<typeof activities>({
    startToCloseTimeout: '10 minutes',
});

export async function RankTrackerWorkflow(siteId: string, keywords: string[]): Promise<void> {
    console.log(`Starting RankTracker workflow for ${siteId}`);

    // 1. Fetch Rank Data
    const rankData = await fetchRankDataActivity(siteId, keywords);

    // 2. Store Rank History
    await storeRankHistoryActivity(siteId, rankData);

    // 3. Detect Volatility
    await detectRankVolatilityActivity(siteId);

    console.log(`RankTracker workflow completed for ${siteId}`);
}
