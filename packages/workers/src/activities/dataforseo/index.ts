import { createDataForSEOClient } from '@apexseo/shared';

export async function getKeywordData(keyword: string): Promise<any> {
    const client = createDataForSEOClient();
    try {
        const suggestions = await client.keywords.getKeywordSuggestions([keyword]);
        // Also get volume for the main keyword if not included
        const volume = await client.keywords.getSearchVolume([keyword]);

        return {
            keyword,
            volume: volume.tasks?.[0]?.result?.[0] || null,
            suggestions: suggestions
        };
    } catch (error: any) {
        console.error(`Failed to get keyword data for ${keyword}:`, error);
        throw error;
    }
}

export async function analyzeSerp(keyword: string): Promise<any> {
    const client = createDataForSEOClient();
    try {
        const serp = await client.serp.getOrganic(keyword);
        return serp.tasks?.[0]?.result?.[0]?.items || [];
    } catch (error: any) {
        console.error(`Failed to analyze SERP for ${keyword}:`, error);
        throw error;
    }
}

export async function getBacklinksData(domain: string): Promise<any> {
    const client = createDataForSEOClient();
    try {
        const summary = await client.backlinks.getSummary(domain);
        const backlinks = await client.backlinks.getBacklinks(domain, 50);

        return {
            summary: summary.tasks?.[0]?.result?.[0] || null,
            backlinks: backlinks.tasks?.[0]?.result?.[0]?.items || []
        };
    } catch (error: any) {
        console.error(`Failed to get backlinks for ${domain}:`, error);
        throw error;
    }
}

export async function runOnPageAudit(url: string): Promise<any> {
    const client = createDataForSEOClient();
    try {
        const audit = await client.onPage.getInstantPages(url);
        return audit.tasks?.[0]?.result?.[0] || null;
    } catch (error: any) {
        console.error(`Failed to run audit for ${url}:`, error);
        throw error;
    }
}
