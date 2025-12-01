import { proxyActivities } from '@temporalio/workflow';
import type * as activities from './activities';

const {
    fetchRobotsAndSitemap,
    resolveSeedUrls,
    crawlBatch,
    selectPagesForEmbedding,
    computePageEmbeddings,
    runClustering,
    labelClusters,
    generateLinkRecommendationsActivity,
    detectOrphanPagesActivity,
    extractClaimsForSite,
    computeClaimRiskScores,
    personaDecideNextAction,
    loadPageInBrowser,
    recordUxEvent,
    finalizeUxSession,
    startUxSession,
    initUxSessionStore,
    fetchRankDataActivity,
    storeRankHistoryActivity,
    detectRankVolatilityActivity,
    fetchBacklinksActivity,
    processBacklinksActivity,
    storeBacklinksActivity
} = proxyActivities<typeof activities>({
    startToCloseTimeout: '5m',
});

export const QUEUE_UX_SIM = 'ux-simulation-queue';
export const QUEUE_SEO_TASKS = 'seo-tasks-queue';

export async function SimulatePersonaSessionWorkflow(args: {
    siteId: string;
    personaId: string;
    goal: string;
    startUrl: string;
    maxSteps: number;
}): Promise<void> {
    await initUxSessionStore();
    const sessionId = await startUxSession(args.siteId, args.personaId, args.goal);
    let currentUrl = args.startUrl;
    let steps = 0;
    let successScore = 0;
    let status: 'completed' | 'failed' = 'failed';
    const startTime = Date.now();

    while (steps < args.maxSteps) {
        const pageState = await loadPageInBrowser(currentUrl);

        await recordUxEvent({
            session_id: sessionId,
            step_number: steps + 1,
            url: currentUrl,
            action: 'view',
            description: `Viewed ${pageState.title}`,
            timestamp: new Date().toISOString().replace('T', ' ').split('.')[0]
        });

        const decision = await personaDecideNextAction(args.personaId, args.goal, pageState);

        if (decision.action === 'succeed') {
            successScore = 100;
            status = 'completed';
            break;
        } else if (decision.action === 'leave') {
            successScore = 10;
            break;
        } else if (decision.action === 'click' && decision.target) {
            currentUrl = decision.target;
            await recordUxEvent({
                session_id: sessionId,
                step_number: steps + 2,
                url: currentUrl,
                action: 'click',
                description: `Clicked ${decision.target}: ${decision.reasoning}`,
                timestamp: new Date().toISOString().replace('T', ' ').split('.')[0]
            });
        }
        steps++;
    }

    const duration = (Date.now() - startTime) / 1000;
    await finalizeUxSession(sessionId, status, successScore, duration);
}

export async function GenerateLinkSuggestionsWorkflow(args: { siteId: string }): Promise<void> {
    await generateLinkRecommendationsActivity(args.siteId);
}

export async function FullSiteAnalysisWorkflow(args: { siteId: string, startUrl: string }): Promise<void> {
    const sitemap = await fetchRobotsAndSitemap(args.siteId);
    const urls = await resolveSeedUrls(args.siteId, sitemap);

    // Batched crawling
    const batchSize = 10;
    for (let i = 0; i < urls.length; i += batchSize) {
        const batch = urls.slice(i, i + batchSize);
        await crawlBatch(args.siteId, batch);
    }

    await selectPagesForEmbedding(args.siteId).then(ids => computePageEmbeddings(args.siteId, ids));
    await runClustering(args.siteId);
    await labelClusters(args.siteId);
    await generateLinkRecommendationsActivity(args.siteId);
    await detectOrphanPagesActivity(args.siteId);
    await extractClaimsForSite(args.siteId);
    await computeClaimRiskScores(args.siteId);
}

export async function RankTrackingWorkflow(args: { siteId: string, keywords: string[] }): Promise<void> {
    const rankData = await fetchRankDataActivity(args.siteId, args.keywords);
    await storeRankHistoryActivity(args.siteId, rankData);
    await detectRankVolatilityActivity(args.siteId);
    await detectRankVolatilityActivity(args.siteId);
}

export async function BacklinkIndexWorkflow(args: { siteId: string, limit: number }): Promise<void> {
    const backlinks = await fetchBacklinksActivity(args.siteId, args.limit);
    if (backlinks.length > 0) {
        await processBacklinksActivity(args.siteId, backlinks);
        await storeBacklinksActivity(args.siteId, backlinks);
    }
}

