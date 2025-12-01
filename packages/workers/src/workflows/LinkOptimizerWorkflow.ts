import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities';

const {
    generateLinkSuggestionsActivity,
    runTSPRActivity,
    runClusteringActivity,
    computePageEmbeddings,
    selectPagesForEmbedding
} = proxyActivities<typeof activities>({
    startToCloseTimeout: '30 minutes',
});

export async function LinkOptimizerWorkflow(siteId: string): Promise<void> {
    // 1. Ensure embeddings are computed (simplified check, ideally we check if fresh)
    const pageIds = await selectPagesForEmbedding(siteId);
    if (pageIds.length > 0) {
        await computePageEmbeddings(siteId, pageIds);
    }

    // 2. Run Clustering
    await runClusteringActivity(siteId);

    // 3. Run TSPR (needed for scoring)
    await runTSPRActivity(siteId);

    // 4. Generate Suggestions
    await generateLinkSuggestionsActivity(siteId);
}
