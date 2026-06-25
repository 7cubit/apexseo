/**
 * GSC Sync Workflow
 * Temporal workflow for syncing Google Search Console data
 */

import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities/gsc/fetch-search-analytics';

const { fetchSearchAnalytics, refreshGscToken, backfillGscData } = proxyActivities<typeof activities>({
    startToCloseTimeout: '10 minutes',
    retry: {
        initialInterval: '30s',
        maximumInterval: '5m',
        maximumAttempts: 3,
    },
});

export interface GscDailySyncParams {
    connectionId: string;
    siteUrl: string;
    projectId: string;
}

export interface GscBackfillParams {
    connectionId: string;
    siteUrl: string;
    projectId: string;
    daysBack: number;
}

/**
 * Daily sync workflow - fetches yesterday's data
 */
export async function gscDailySyncWorkflow(params: GscDailySyncParams) {
    // Step 1: Refresh OAuth token if needed
    await refreshGscToken({ connectionId: params.connectionId });

    // Step 2: Calculate yesterday's date (GSC has 2-3 day delay)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 3); // Use 3-day delay to ensure data is final
    const dateStr = yesterday.toISOString().split('T')[0];

    // Step 3: Fetch search analytics data
    const result = await fetchSearchAnalytics({
        connectionId: params.connectionId,
        siteUrl: params.siteUrl,
        startDate: dateStr,
        endDate: dateStr,
        dimensions: ['query', 'page', 'date'],
        rowLimit: 25000,
    });

    return {
        success: true,
        rowsIngested: result.rowsIngested,
        date: dateStr,
        duration: result.duration,
    };
}

/**
 * Backfill workflow - fetches historical data
 * Processes in chunks to avoid API rate limits
 */
export async function gscBackfillWorkflow(params: GscBackfillParams) {
    // Step 1: Refresh OAuth token
    await refreshGscToken({ connectionId: params.connectionId });

    // Step 2: Backfill historical data
    const result = await backfillGscData({
        connectionId: params.connectionId,
        siteUrl: params.siteUrl,
        projectId: params.projectId,
        daysBack: params.daysBack,
    });

    return {
        success: true,
        totalRowsIngested: result.totalRowsIngested,
        daysProcessed: result.daysProcessed,
    };
}
