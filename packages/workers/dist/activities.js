"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateEmbedding = void 0;
exports.parseHtml = parseHtml;
exports.persistData = persistData;
exports.enrichSerp = enrichSerp;
exports.fetchRobotsAndSitemap = fetchRobotsAndSitemap;
exports.resolveSeedUrls = resolveSeedUrls;
exports.crawlBatch = crawlBatch;
exports.selectPagesForEmbedding = selectPagesForEmbedding;
exports.computePageEmbeddings = computePageEmbeddings;
exports.runClustering = runClustering;
exports.labelClusters = labelClusters;
exports.generateLinkRecommendationsActivity = generateLinkRecommendationsActivity;
exports.detectOrphanPagesActivity = detectOrphanPagesActivity;
exports.initUxSessionStore = initUxSessionStore;
exports.startUxSession = startUxSession;
exports.loadPageInBrowser = loadPageInBrowser;
exports.personaDecideNextAction = personaDecideNextAction;
exports.recordUxEvent = recordUxEvent;
exports.finalizeUxSession = finalizeUxSession;
exports.extractClaimsForSite = extractClaimsForSite;
exports.computeClaimRiskScores = computeClaimRiskScores;
exports.fetchRankDataActivity = fetchRankDataActivity;
exports.storeRankHistoryActivity = storeRankHistoryActivity;
exports.fetchBacklinksActivity = fetchBacklinksActivity;
exports.processBacklinksActivity = processBacklinksActivity;
exports.storeBacklinksActivity = storeBacklinksActivity;
exports.detectRankVolatilityActivity = detectRankVolatilityActivity;
const shared_1 = require("@apexseo/shared");
Object.defineProperty(exports, "generateEmbedding", { enumerable: true, get: function () { return shared_1.generateEmbedding; } });
// import { savePageWithLinks, saveBacklink } from '@apexseo/shared'; // Need to export these
// import { generateEmbedding } from '@apexseo/shared'; // Need to export this
// Mock parsing for now, or use cheerio if available
async function parseHtml(html, url) {
    shared_1.logger.info(`Parsing HTML for ${url}`);
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
async function persistData(data) {
    shared_1.logger.info(`Persisting data for ${data.url}`);
    // Save to ClickHouse
    await shared_1.ClickHousePageRepository.createPage({
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
        internalLinks: data.links.map((link) => ({ url: link, text: '' }))
    };
    await (0, shared_1.savePageWithLinks)(data.siteId, neo4jData);
}
async function enrichSerp(keyword) {
    shared_1.logger.info(`Enriching SERP for ${keyword}`);
    const client = new shared_1.DataForSEOClient();
    // Mock or real call
    // return await client.getSerp(keyword);
    return { keyword, results: [] };
}
const cheerio = __importStar(require("cheerio"));
// --- Ingestion Activities ---
async function fetchRobotsAndSitemap(siteId) {
    console.log(`Fetching robots.txt and sitemap for ${siteId}`);
    // Basic implementation: try standard sitemap paths
    // In production, use a robust sitemap parser
    const sitemapUrls = [
        `https://${siteId}/sitemap.xml`,
        `https://${siteId}/sitemap_index.xml`
    ];
    return { sitemapUrls };
}
async function resolveSeedUrls(siteId, sitemapData) {
    console.log(`Resolving seed URLs for ${siteId}`);
    // Try to fetch sitemap and extract URLs
    const urls = [];
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
        }
        catch (e) {
            console.warn(`Failed to fetch sitemap ${sitemapUrl}`, e);
        }
    }
    if (urls.length === 0) {
        // Fallback to homepage
        return [`https://${siteId}`];
    }
    return urls.slice(0, 100); // Limit for MVP
}
async function crawlBatch(siteId, urls) {
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
            const internalLinks = [];
            $("a[href]").each((_, el) => {
                const href = $(el).attr("href");
                const linkText = $(el).text().trim().substring(0, 50);
                if (href && (href.startsWith("/") || href.includes(siteId))) {
                    try {
                        const absoluteUrl = new URL(href, url).href;
                        internalLinks.push({ url: absoluteUrl, text: linkText });
                    }
                    catch (e) { }
                }
            });
            // 2. Write to Neo4j
            await (0, shared_1.savePageWithLinks)(siteId, {
                url,
                title,
                text,
                wordCount,
                internalLinks
            });
            // 3. Write to ClickHouse
            await shared_1.ClickHousePageRepository.createPage({
                site_id: siteId,
                page_id: Buffer.from(url).toString('base64'),
                url,
                title,
                h1,
                text,
                status: 'ok'
            });
            results.push({ url, status: 'ok' });
        }
        catch (error) {
            console.error(`Failed to crawl ${url}`, error);
            results.push({ url, status: 'error' });
        }
    }
    return results;
}
// --- Analysis Activities ---
async function selectPagesForEmbedding(siteId) {
    const pages = await shared_1.ClickHousePageRepository.getPagesBySite(siteId);
    return pages.map((p) => p.page_id);
}
async function computePageEmbeddings(siteId, pageIds) {
    console.log(`Computing embeddings for ${pageIds.length} pages`);
    for (const pageId of pageIds) {
        const page = await shared_1.ClickHousePageRepository.getPageById(pageId);
        if (page && page.text) {
            try {
                const embedding = await (0, shared_1.generateEmbedding)(page.text.substring(0, 8000));
                await shared_1.ClickHouseEmbeddingStore.saveEmbedding(siteId, pageId, embedding);
            }
            catch (e) {
                console.error(`Failed to generate embedding for ${pageId}`, e);
            }
        }
    }
}
async function runClustering(siteId) {
    console.log(`Running clustering for ${siteId}`);
    // Basic K-Means placeholder - in real app use ml-kmeans on embeddings
    // For now, assign random clusters 0-4
    const pages = await shared_1.ClickHousePageRepository.getPagesBySite(siteId);
    for (const page of pages) {
        const clusterId = Math.floor(Math.random() * 5);
        // Update Neo4j or ClickHouse with cluster
        // We need a method to update cluster. 
        // Let's assume we update Neo4j for now as it's used for graph.
        // PageRepository.updateCluster(page.url, clusterId);
    }
    return { clusters: [0, 1, 2, 3, 4] };
}
async function labelClusters(siteId) {
    console.log(`Labeling clusters for ${siteId}`);
}
async function generateLinkRecommendationsActivity(siteId) {
    console.log(`Generating link recommendations for ${siteId}`);
    // This logic is now handled by the API route calling this workflow, 
    // but ideally we move the logic here.
    // For now, we can leave it as a placeholder or move the logic from the API route here.
    // Given constraints, we'll leave it as is, but the workflow structure is ready.
}
async function detectOrphanPagesActivity(siteId) {
    console.log(`Detecting orphan pages for ${siteId}`);
}
// --- UX Simulation Activities ---
async function initUxSessionStore() {
    await shared_1.ClickHouseUxSessionStore.initialize();
}
async function startUxSession(siteId, persona, goal) {
    const sessionId = crypto.randomUUID();
    const session = {
        session_id: sessionId,
        site_id: siteId,
        persona,
        goal,
        status: 'running',
        duration: 0,
        success_score: 0,
        created_at: new Date().toISOString().replace('T', ' ').split('.')[0]
    };
    await shared_1.ClickHouseUxSessionStore.saveSession(session);
    return sessionId;
}
async function loadPageInBrowser(url) {
    console.log(`[Mock Browser] Loading ${url}`);
    // Try to fetch real content if it's a real URL
    try {
        const res = await fetch(url);
        if (res.ok) {
            const html = await res.text();
            const $ = cheerio.load(html);
            const title = $('title').text();
            const links = [];
            $('a[href]').each((_, el) => {
                links.push({ text: $(el).text().substring(0, 50), url: $(el).attr('href') || '' });
            });
            return { title, links, content: $('body').text().substring(0, 500) };
        }
    }
    catch (e) { }
    return {
        title: "Mock Page",
        links: [],
        content: "Failed to load page or mock content."
    };
}
async function personaDecideNextAction(persona, goal, pageState) {
    // Simple heuristic
    const random = Math.random();
    if (random > 0.9)
        return { action: 'succeed', reasoning: "Goal achieved" };
    if (random < 0.2)
        return { action: 'leave', reasoning: "Bored" };
    if (pageState.links.length > 0) {
        const link = pageState.links[Math.floor(Math.random() * pageState.links.length)];
        return { action: 'click', target: link.url, reasoning: "Exploring" };
    }
    return { action: 'leave', reasoning: "No links found" };
}
async function recordUxEvent(event) {
    await shared_1.ClickHouseUxSessionStore.saveEvent(event);
}
async function finalizeUxSession(sessionId, status, successScore, duration) {
    await shared_1.ClickHouseUxSessionStore.updateSessionStatus(sessionId, status, successScore, duration);
}
// --- Truth Activities ---
async function extractClaimsForSite(siteId) {
    console.log(`Extracting claims for ${siteId}`);
}
async function computeClaimRiskScores(siteId) {
    console.log(`Computing risk scores for ${siteId}`);
}
// --- Rank Tracking Activities ---
async function fetchRankDataActivity(siteId, keywords) {
    var _a, _b, _c;
    console.log(`Fetching rank data for ${siteId} with keywords: ${keywords.join(', ')}`);
    const client = new shared_1.DataForSEOClient();
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
                if ((_c = (_b = (_a = volumeData === null || volumeData === void 0 ? void 0 : volumeData.tasks) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.result) === null || _c === void 0 ? void 0 : _c[0]) {
                    const result = volumeData.tasks[0].result[0];
                    searchVolume = result.search_volume || 0;
                    cpc = result.cpc || 0;
                }
            }
            catch (e) {
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
            }
            else {
                console.log(`No rank found for ${keyword} on ${siteId}`);
                results.push({
                    keyword,
                    rank: 0,
                    url: '',
                    search_volume: searchVolume,
                    cpc: cpc
                });
            }
        }
        catch (error) {
            console.error(`Failed to fetch rank for ${keyword}`, error);
        }
    }
    return results;
}
async function storeRankHistoryActivity(siteId, rankData) {
    console.log(`Storing rank history for ${siteId}`);
    // Ensure table exists
    await shared_1.ClickHouseRankRepository.createTable();
    for (const item of rankData) {
        // Get previous rank to calculate volatility and change
        const previous = await shared_1.ClickHouseRankRepository.getLatestRank(siteId, item.keyword);
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
        const historyItem = {
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
        await shared_1.ClickHouseRankRepository.insertRank(historyItem);
    }
}
async function fetchBacklinksActivity(siteId, limit = 100) {
    var _a, _b, _c, _d;
    console.log(`Fetching backlinks for ${siteId}`);
    const client = new shared_1.DataForSEOClient();
    try {
        const data = await client.getBacklinks(siteId, limit);
        if ((_d = (_c = (_b = (_a = data === null || data === void 0 ? void 0 : data.tasks) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.result) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.items) {
            return data.tasks[0].result[0].items;
        }
        return [];
    }
    catch (error) {
        console.error(`Failed to fetch backlinks for ${siteId}`, error);
        return [];
    }
}
async function processBacklinksActivity(siteId, backlinks) {
    console.log(`Processing ${backlinks.length} backlinks for ${siteId}`);
    // Save to Neo4j
    for (const backlink of backlinks) {
        await (0, shared_1.saveBacklink)(siteId, {
            referring_domain: backlink.domain_from,
            spam_score: backlink.spam_score || 0,
            backlink_url: backlink.url_from,
            anchor_text: backlink.anchor || '',
            is_dofollow: !backlink.is_nofollow,
            date_found: backlink.first_seen ? backlink.first_seen.split(' ')[0] : new Date().toISOString().split('T')[0]
        });
    }
}
async function storeBacklinksActivity(siteId, backlinks) {
    console.log(`Storing ${backlinks.length} backlinks for ${siteId} in ClickHouse`);
    await shared_1.ClickHouseBacklinkRepository.createTable();
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
    await shared_1.ClickHouseBacklinkRepository.insertBacklinks(records);
}
async function detectRankVolatilityActivity(siteId, threshold = 5) {
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
