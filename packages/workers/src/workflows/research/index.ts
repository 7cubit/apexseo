import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../../activities/dataforseo';

const { getKeywordData, analyzeSerp, getBacklinksData, runOnPageAudit } = proxyActivities<typeof activities>({
    startToCloseTimeout: '1m',
    retry: {
        initialInterval: '1s',
        backoffCoefficient: 2,
        maximumAttempts: 3,
    }
});

export async function keywordResearchWorkflow(keyword: string): Promise<any> {
    // Parallel execution of keyword data and SERP analysis
    const [keywordData, serpData] = await Promise.all([
        getKeywordData(keyword),
        analyzeSerp(keyword)
    ]);

    return {
        keywordData,
        serpData
    };
}

export async function domainAnalysisWorkflow(domain: string): Promise<any> {
    // Parallel execution of backlinks and audit
    const [backlinks, audit] = await Promise.all([
        getBacklinksData(domain),
        runOnPageAudit(`https://${domain}`) // Assuming https
    ]);

    return {
        backlinks,
        audit
    };
}
