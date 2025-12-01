import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities';

const {
    runTSPRActivity,
    calculateHealthScoresActivity,
    checkHealthRegressionActivity,
    detectCannibalizationActivity
} = proxyActivities<typeof activities>({
    startToCloseTimeout: '30 minutes',
});

export async function SiteDoctorWorkflow(siteId: string): Promise<void> {
    console.log(`Starting SiteDoctor workflow for ${siteId}`);

    // 1. Re-calculate TSPR (Topic-Sensitive PageRank)
    await runTSPRActivity(siteId);

    // 2. Re-calculate Health Scores
    await calculateHealthScoresActivity(siteId);

    // 3. Check for Health Regression (and alert if needed)
    await checkHealthRegressionActivity(siteId);

    // 4. Detect Cannibalization (and alert if needed)
    await detectCannibalizationActivity(siteId);

    console.log(`SiteDoctor workflow completed for ${siteId}`);
}
