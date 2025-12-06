/**
 * GSC Data Types
 * Type definitions for Google Search Console integration
 */

export interface GscConnection {
    id: string;
    userId: string;
    projectId?: string;
    siteUrl: string;
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
    lastSyncAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface GscSearchAnalyticsRow {
    siteUrl: string;
    projectId: string;
    query: string;
    page: string;
    date: string; // YYYY-MM-DD
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
    country?: string;
    device?: string;
}

export interface GscDailySummary {
    siteUrl: string;
    projectId: string;
    date: string;
    totalClicks: number;
    totalImpressions: number;
    avgCtr: number;
    avgPosition: number;
    uniqueQueries: number;
    uniquePages: number;
}

export interface GscTopQuery {
    query: string;
    totalClicks: number;
    totalImpressions: number;
    avgPosition: number;
    avgCtr: number;
}

export interface GscPagePerformance {
    page: string;
    totalClicks: number;
    totalImpressions: number;
    avgPosition: number;
    uniqueQueries: number;
}

export interface GscSyncParams {
    connectionId: string;
    siteUrl: string;
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
    dimensions?: ('query' | 'page' | 'date' | 'country' | 'device')[];
    rowLimit?: number;
}

export interface GscSyncResult {
    rowsIngested: number;
    startDate: string;
    endDate: string;
    siteUrl: string;
    duration: number; // milliseconds
}
