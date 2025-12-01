import { PageRepository, savePageWithLinks } from '@/lib/neo4j/repositories/PageRepository';
import { ClickHousePageRepository } from '@/lib/clickhouse/repositories/ClickHousePageRepository';
import { ClickHouseEmbeddingStore } from '@/lib/clickhouse/repositories/ClickHouseEmbeddingStore';
import { ClickHouseClusterStore } from '@/lib/clickhouse/repositories/ClickHouseClusterStore';
import { ClickHouseUxSessionStore, UxSession, UxEvent } from '@/lib/clickhouse/repositories/ClickHouseUxSessionStore';
import { ClickHouseRankRepository, RankHistory } from '@/lib/clickhouse/repositories/ClickHouseRankRepository';
import { ClickHouseBacklinkRepository } from '@/lib/clickhouse/repositories/ClickHouseBacklinkRepository';
import { saveBacklink } from '@/lib/neo4j';
import { DataForSEOClient } from '@/lib/dataforseo';
import { generateEmbedding } from '@/lib/embeddings';
import * as cheerio from 'cheerio';

// --- Ingestion Activities ---

export async function fetchRobotsAndSitemap(siteId: string): Promise<any> {
    console.log(`Fetching robots.txt and sitemap for ${siteId}`);
    // Basic implementation: try standard sitemap paths
    // In production, use a robust sitemap parser
    const sitemapUrls = [
        `https://${siteId}/sitemap.xml`,
        `https://${siteId}/sitemap_index.xml`
    ];
    return { sitemapUrls };
}

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

            const internalLinks: { url: string, text: string }[] = [];
            $("a[href]").each((_, el) => {
                const href = $(el).attr("href");
                const linkText = $(el).text().trim().substring(0, 50);
                if (href && (href.startsWith("/") || href.includes(siteId))) {
                    try {
                        const absoluteUrl = new URL(href, url).href;
                        internalLinks.push({ url: absoluteUrl, text: linkText });
                    } catch (e) { }
                }
            });

            // 2. Write to Neo4j
            await savePageWithLinks(siteId, {
                url,
                title,
                text,
                wordCount,
                internalLinks
            });

            // 3. Write to ClickHouse
            await ClickHousePageRepository.createPage({
                site_id: siteId,
                page_id: Buffer.from(url).toString('base64'),
                url,
                title,
                h1,
                text,
                status: 'ok'
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
