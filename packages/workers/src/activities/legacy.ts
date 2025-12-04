import {
    ClickHousePageRepository,
    ClickHouseEmbeddingStore,
    ClickHouseClusterStore,
    ClickHouseUxSessionStore,
    ClickHouseRankRepository,
    ClickHouseBacklinkRepository,
    DataForSEOClient,
    logger,
    UxSession,
    UxEvent,
    RankHistory,
    savePageWithLinks,
    saveBacklink,
    generateEmbedding,
    GraphRepository,
    CannibalizationService,
    ClickHouseAlertRepository,
    Alert
} from '@apexseo/shared';

// import { savePageWithLinks, saveBacklink } from '@apexseo/shared'; // Need to export these
// import { generateEmbedding } from '@apexseo/shared'; // Need to export this

// Mock parsing for now, or use cheerio if available
export async function parseHtml(html: string, url: string): Promise<any> {
    logger.info(`Parsing HTML for ${url}`);
    // Simple mock extraction
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    const title = titleMatch ? titleMatch[1] : 'No Title';

    // Extract links (mock)
    const links = [];
    const linkRegex = /href=["'](http[^"']+)["']/g;
    let match;
    while ((match = linkRegex.exec(html)) !== null) {
        links.push(match[1]);
    }

    return {
        url,
        title,
        content: 'Mock content', // In real impl, strip tags
        links: links.slice(0, 10) // Limit links for now
    };
}

export async function persistData(data: any): Promise<void> {
    logger.info(`Persisting data for ${data.url}`);

    // Save to ClickHouse
    await ClickHousePageRepository.createPage({
        site_id: data.siteId,
        page_id: data.url, // Using URL as ID for now, or generate UUID
        url: data.url,
        title: data.title,
        status: '200',
        content_score: 0, // Default
        // ... other fields
    });

    // Save to Neo4j
    // Convert string links to object links expected by savePageWithLinks
    const neo4jData = {
        ...data,
        internalLinks: data.links.map((link: string) => ({ url: link, text: '' }))
    };
    await savePageWithLinks(data.siteId, neo4jData);
}

export async function enrichSerp(keyword: string): Promise<any> {
    logger.info(`Enriching SERP for ${keyword}`);
    const client = new DataForSEOClient();
    // Mock or real call
    // return await client.getSerp(keyword);
    return { keyword, results: [] };
}

export { generateEmbedding }; // Re-export for worker use if needed as activity, or just use directly

import * as cheerio from 'cheerio';

// --- Ingestion Activities ---

// fetchRobotsAndSitemap removed to avoid conflict with new activity

export async function resolveSeedUrls(siteId: string, sitemapData: any): Promise<string[]> {
    console.log(`Resolving seed URLs for ${siteId}`);
    // Try to fetch sitemap and extract URLs
    const urls: string[] = [];
    for (const sitemapUrl of sitemapData.sitemapUrls) {
        try {
            const res = await fetch(sitemapUrl);
            if (res.ok) {
                const text = await res.text();
                const $ = cheerio.load(text, { xmlMode: true });
                $('loc').each((_, el) => {
                    urls.push($(el).text());
                });
            }
        } catch (e) {
            console.warn(`Failed to fetch sitemap ${sitemapUrl}`, e);
        }
    }

    if (urls.length === 0) {
        // Fallback to homepage
        return [`https://${siteId}`];
    }

    return urls.slice(0, 100); // Limit for MVP
}

export async function crawlBatch(siteId: string, urls: string[]): Promise<any> {
    console.log(`Crawling batch of ${urls.length} pages for ${siteId}`);
    const results = [];
    for (const url of urls) {
        try {
            const response = await fetch(url, { headers: { "User-Agent": "ApexSEO-Bot/1.0" } });
            if (!response.ok) {
                results.push({ url, status: 'error', code: response.status });
                continue;
            }

            const html = await response.text();
            const $ = cheerio.load(html);
            const title = $("title").text();
            const h1 = $("h1").first().text();
            const text = $("body").text().replace(/\s+/g, " ").trim();
            const wordCount = text.split(" ").length;
            const canonicalUrl = $('link[rel="canonical"]').attr('href');

            const links: { url: string, text: string, isInternal: boolean, rel?: string }[] = [];
            $("a[href]").each((_, el) => {
                const href = $(el).attr("href");
                const linkText = $(el).text().trim().substring(0, 50);
                const rel = $(el).attr("rel");

                if (href) {
                    try {
                        const absoluteUrl = new URL(href, url).href;
                        const isInternal = absoluteUrl.includes(siteId) || (new URL(absoluteUrl).hostname === new URL(url).hostname);
                        links.push({
                            url: absoluteUrl,
                            text: linkText,
                            isInternal,
                            rel
                        });
                    } catch (e) { }
                }
            });

            // 2. Write to Neo4j using GraphRepository
            await GraphRepository.saveGraphData({
                url,
                title,
                h1,
                canonicalUrl: canonicalUrl ? new URL(canonicalUrl, url).href : undefined,
                links,
                siteId
            });

            // 3. Write to ClickHouse
            await ClickHousePageRepository.createPage({
                site_id: siteId,
                page_id: Buffer.from(url).toString('base64'),
                url,
                title,
                h1,
                content: text,
                status: 'ok',
                word_count: wordCount,
                canonical_id: canonicalUrl ? Buffer.from(new URL(canonicalUrl, url).href).toString('base64') : undefined,
                link_count_internal: links.filter(l => l.isInternal).length,
                link_count_external: links.filter(l => !l.isInternal).length
            });

            results.push({ url, status: 'ok' });
        } catch (error) {
            console.error(`Failed to crawl ${url}`, error);
            results.push({ url, status: 'error' });
        }
    }
    return results;
}

// --- Analysis Activities ---

export async function selectPagesForEmbedding(siteId: string): Promise<string[]> {
    const pages = await ClickHousePageRepository.getPagesBySite(siteId);
    return pages.map((p: any) => p.page_id);
}

export async function computePageEmbeddings(siteId: string, pageIds: string[]): Promise<void> {
    console.log(`Computing embeddings for ${pageIds.length} pages`);
    for (const pageId of pageIds) {
        const page = await ClickHousePageRepository.getPageById(pageId) as any;
        if (page && page.text) {
            try {
                const embedding = await generateEmbedding(page.text.substring(0, 8000));
                await ClickHouseEmbeddingStore.saveEmbedding(siteId, pageId, embedding);
            } catch (e) {
                console.error(`Failed to generate embedding for ${pageId}`, e);
            }
        }
    }
}

export async function runClustering(siteId: string): Promise<any> {
    console.log(`Running clustering for ${siteId}`);
    // Basic K-Means placeholder - in real app use ml-kmeans on embeddings
    // For now, assign random clusters 0-4
    const pages = await ClickHousePageRepository.getPagesBySite(siteId);
    for (const page of pages as any[]) {
        const clusterId = Math.floor(Math.random() * 5);
        // Update Neo4j or ClickHouse with cluster
        // We need a method to update cluster. 
        // Let's assume we update Neo4j for now as it's used for graph.
        // PageRepository.updateCluster(page.url, clusterId);
    }
    return { clusters: [0, 1, 2, 3, 4] };
}

export async function labelClusters(siteId: string): Promise<void> {
    console.log(`Labeling clusters for ${siteId}`);
}

export async function generateLinkRecommendationsActivity(siteId: string): Promise<void> {
    console.log(`Generating link recommendations for ${siteId}`);
    // This logic is now handled by the API route calling this workflow, 
    // but ideally we move the logic here.
    // For now, we can leave it as a placeholder or move the logic from the API route here.
    // Given constraints, we'll leave it as is, but the workflow structure is ready.
}

export async function detectOrphanPagesActivity(siteId: string): Promise<void> {
    console.log(`Detecting orphan pages for ${siteId}`);
    try {
        // 1. Find orphans in Neo4j
        // Assuming siteId is the domain name for now
        const orphans = await GraphRepository.findOrphanPages(siteId);
        console.log(`Found ${orphans.length} orphan pages for ${siteId}`);

        if (orphans.length > 0) {
            // 2. Update ClickHouse
            // Convert URLs to page_ids (base64)
            const pageIds = orphans.map(url => Buffer.from(url).toString('base64'));
            await ClickHousePageRepository.updateOrphanStatus(siteId, pageIds, true);
        }
    } catch (error) {
        console.error(`Failed to detect orphans for ${siteId}`, error);
        throw error;
    }
}

// --- UX Simulation Activities ---

export async function initUxSessionStore(): Promise<void> {
    await ClickHouseUxSessionStore.initialize();
}

export async function startUxSession(siteId: string, persona: string, goal: string): Promise<string> {
    const sessionId = crypto.randomUUID();
    const session: UxSession = {
        session_id: sessionId,
        site_id: siteId,
        persona,
        goal,
        status: 'running',
        duration: 0,
        success_score: 0,
        created_at: new Date().toISOString().replace('T', ' ').split('.')[0]
    };
    await ClickHouseUxSessionStore.saveSession(session);
    return sessionId;
}

export async function loadPageInBrowser(url: string): Promise<{ title: string, links: { text: string, url: string }[], content: string }> {
    console.log(`[Mock Browser] Loading ${url}`);
    // Try to fetch real content if it's a real URL
    try {
        const res = await fetch(url);
        if (res.ok) {
            const html = await res.text();
            const $ = cheerio.load(html);
            const title = $('title').text();
            const links: { text: string, url: string }[] = [];
            $('a[href]').each((_, el) => {
                links.push({ text: $(el).text().substring(0, 50), url: $(el).attr('href') || '' });
            });
            return { title, links, content: $('body').text().substring(0, 500) };
        }
    } catch (e) { }

    return {
        title: "Mock Page",
        links: [],
        content: "Failed to load page or mock content."
    };
}

export async function personaDecideNextAction(persona: string, goal: string, pageState: any): Promise<{ action: 'click' | 'leave' | 'succeed', target?: string, reasoning: string }> {
    // Simple heuristic
    const random = Math.random();
    if (random > 0.9) return { action: 'succeed', reasoning: "Goal achieved" };
    if (random < 0.2) return { action: 'leave', reasoning: "Bored" };

    if (pageState.links.length > 0) {
        const link = pageState.links[Math.floor(Math.random() * pageState.links.length)];
        return { action: 'click', target: link.url, reasoning: "Exploring" };
    }

    return { action: 'leave', reasoning: "No links found" };
}

export async function recordUxEvent(event: UxEvent): Promise<void> {
    await ClickHouseUxSessionStore.saveEvent(event);
}

export async function finalizeUxSession(sessionId: string, status: 'completed' | 'failed', successScore: number, duration: number): Promise<void> {
    await ClickHouseUxSessionStore.updateSessionStatus(sessionId, status, successScore, duration);
}

// --- Truth Activities ---

export async function extractClaimsForSite(siteId: string): Promise<void> {
    console.log(`Extracting claims for ${siteId}`);
}

export async function computeClaimRiskScores(siteId: string): Promise<void> {
    console.log(`Computing risk scores for ${siteId}`);
}


// --- Rank Tracking Activities ---

export async function fetchRankDataActivity(siteId: string, keywords: string[]): Promise<any[]> {
    console.log(`Fetching rank data for ${siteId} with keywords: ${keywords.join(', ')}`);
    const client = new DataForSEOClient();
    const results = [];

    // In a real scenario, we might want to get the site URL from the siteId or another source
    // For now, assuming siteId is the domain (e.g., 'example.com')
    const siteUrl = siteId;

    for (const keyword of keywords) {
        try {
            // Fetch search volume first
            let searchVolume = 0;
            let cpc = 0;
            try {
                const volumeData = await client.getSearchVolume([keyword]);
                if (volumeData?.tasks?.[0]?.result?.[0]) {
                    const result = volumeData.tasks[0].result[0];
                    searchVolume = result.search_volume || 0;
                    cpc = result.cpc || 0;
                }
            } catch (e) {
                console.warn(`Failed to fetch volume for ${keyword}`, e);
            }

            const rankData = await client.getSerpRank(keyword, siteUrl);
            if (rankData) {
                results.push({
                    keyword,
                    rank: rankData.rank,
                    url: rankData.url,
                    search_volume: searchVolume,
                    cpc: cpc
                });
            } else {
                console.log(`No rank found for ${keyword} on ${siteId}`);
                results.push({
                    keyword,
                    rank: 0,
                    url: '',
                    search_volume: searchVolume,
                    cpc: cpc
                });
            }
        } catch (error) {
            console.error(`Failed to fetch rank for ${keyword}`, error);
        }
    }
    return results;
}

export async function storeRankHistoryActivity(siteId: string, rankData: any[]): Promise<void> {
    console.log(`Storing rank history for ${siteId}`);

    // Ensure table exists
    await ClickHouseRankRepository.createTable();

    for (const item of rankData) {
        // Get previous rank to calculate volatility and change
        const previous = await ClickHouseRankRepository.getLatestRank(siteId, item.keyword);
        let volatility = 0;
        let changeFromYesterday = 0;

        if (previous) {
            // If previous rank was 0 (not found) and now we have a rank, volatility is high (or handled differently)
            // If current rank is 0, volatility is also interesting.
            // Simple difference for now.
            if (previous.rank_position > 0 && item.rank > 0) {
                volatility = Math.abs(previous.rank_position - item.rank);
                changeFromYesterday = previous.rank_position - item.rank; // Positive means improvement (rank went down numerically)
            }
        }

        const historyItem: RankHistory = {
            site_id: siteId,
            keyword: item.keyword,
            rank_position: item.rank,
            url: item.url,
            rank_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
            search_volume: item.search_volume || 0,
            cpc: item.cpc || 0,
            serp_features: [], // Placeholder as we don't extract features yet
            rank_volatility: volatility,
            change_from_yesterday: changeFromYesterday
        };

        await ClickHouseRankRepository.insertRank(historyItem);
    }
}

export async function fetchBacklinksActivity(siteId: string, limit: number = 100): Promise<any[]> {
    console.log(`Fetching backlinks for ${siteId}`);
    const client = new DataForSEOClient();
    try {
        const data = await client.getBacklinks(siteId, limit);
        if (data?.tasks?.[0]?.result?.[0]?.items) {
            return data.tasks[0].result[0].items;
        }
        return [];
    } catch (error) {
        console.error(`Failed to fetch backlinks for ${siteId}`, error);
        return [];
    }
}

export async function processBacklinksActivity(siteId: string, backlinks: any[]): Promise<void> {
    console.log(`Processing ${backlinks.length} backlinks for ${siteId}`);
    // Save to Neo4j
    for (const backlink of backlinks) {
        await saveBacklink(siteId, {
            referring_domain: backlink.domain_from,
            spam_score: backlink.spam_score || 0,
            backlink_url: backlink.url_from,
            anchor_text: backlink.anchor || '',
            is_dofollow: !backlink.is_nofollow,
            date_found: backlink.first_seen ? backlink.first_seen.split(' ')[0] : new Date().toISOString().split('T')[0]
        });
    }
}

export async function storeBacklinksActivity(siteId: string, backlinks: any[]): Promise<void> {
    console.log(`Storing ${backlinks.length} backlinks for ${siteId} in ClickHouse`);
    await ClickHouseBacklinkRepository.createTable();

    const records = backlinks.map(b => ({
        site_id: siteId,
        referring_domain: b.domain_from,
        backlink_url: b.url_from,
        target_url: b.url_to,
        anchor_text: b.anchor || '',
        is_dofollow: !b.is_nofollow,
        spam_score: b.spam_score || 0,
        date_found: b.first_seen ? b.first_seen.split(' ')[0] : new Date().toISOString().split('T')[0],
        domain_relevance: b.rank_source || 0 // Using rank_source as proxy for relevance for now
    }));

    await ClickHouseBacklinkRepository.insertBacklinks(records);
}

export async function detectRankVolatilityActivity(siteId: string, threshold: number = 5): Promise<void> {
    console.log(`Detecting rank volatility for ${siteId}`);
    // This could be a complex query or just checking the latest insertions.
    // For now, we'll just log high volatility based on the logic in storeRankHistoryActivity
    // In a real app, this might trigger alerts.

    // We can query the repository for recent high volatility
    // But since we just inserted it, we could have returned it from storeRankHistoryActivity.
    // For separation of concerns, let's query.

    // Placeholder for now as we calculated volatility during insertion.
    // We could query: SELECT * FROM rank_history WHERE site_id = ... AND timestamp > now() - 1h AND volatility_score > 5
}

export * from './graph-writer';
export * from './link-optimizer';

// Analysis Activities
import { TSPRService, ClusteringService, HealthScoreService } from '@apexseo/shared';

export const runTSPRActivity = async (projectId: string) => {
    await TSPRService.runTSPR(projectId);
};

export const runClusteringActivity = async (projectId: string) => {
    await ClusteringService.runClustering(projectId);
};

export const calculateHealthScoresActivity = async (projectId: string) => {
    await HealthScoreService.calculateAndSave(projectId);
};

export async function detectCannibalizationActivity(siteId: string): Promise<void> {
    console.log(`Detecting cannibalization for ${siteId}`);
    try {
        const issues = await CannibalizationService.analyze(siteId);

        // Filter for high priority issues to alert
        const highPriorityIssues = issues.filter(issue => issue.priority === 'High');

        if (highPriorityIssues.length > 0) {
            console.log(`Found ${highPriorityIssues.length} high priority cannibalization issues for ${siteId}`);

            // Create a consolidated alert or individual alerts
            // For now, let's create one alert summarizing the issues
            const alert: Alert = {
                site_id: siteId,
                type: 'cannibalization',
                severity: 'high',
                message: `Found ${highPriorityIssues.length} critical keyword cannibalization issues.`,
                details: JSON.stringify(highPriorityIssues.slice(0, 5)), // Top 5 issues
                status: 'new'
            };

            await ClickHouseAlertRepository.createTable();
            await ClickHouseAlertRepository.createAlert(alert);
        }
    } catch (error) {
        console.error(`Failed to detect cannibalization for ${siteId}`, error);
    }
}

export async function sendAlertActivity(alert: Alert): Promise<void> {
    console.log(`Sending alert for ${alert.site_id}: ${alert.message}`);
    try {
    } catch (error) {
        console.error(`Failed to send alert`, error);
    }
}

export * from './site-doctor';

