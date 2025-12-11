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
const shared_1 = require("@apexseo/shared");
const keywordsRoutes = async (fastify, opts) => {
    const dataForSEO = new shared_1.DataForSEOClient();
    // Keyword Research - Get suggestions
    fastify.get('/keywords/research', async (request, reply) => {
        const { query, location = 'United States' } = request.query;
        if (!query) {
            return reply.status(400).send({ error: 'Query parameter is required' });
        }
        try {
            // Get keyword suggestions from DataForSEO
            const suggestions = await dataForSEO.getKeywordSuggestions(query, location);
            // Get search volume data
            const volumeData = await dataForSEO.getSearchVolume(suggestions.slice(0, 100) // Limit to 100 keywords
            );
            return { keywords: volumeData };
        }
        catch (error) {
            request.log.error(error);
            reply.status(500).send({ error: 'Failed to fetch keyword data' });
        }
    });
    // Get tracked keywords for a project
    fastify.get('/keywords/tracking/:projectId', async (request, reply) => {
        const { projectId } = request.params;
        try {
            // Fetch from ClickHouse rank_history
            // This uses existing RankTracker data
            const { ClickHouseRankRepository } = await Promise.resolve().then(() => __importStar(require('@apexseo/shared')));
            const history = await ClickHouseRankRepository.getSiteHistory(projectId, 30);
            // Group by keyword and get latest position
            const keywordMap = new Map();
            for (const record of history) {
                if (!keywordMap.has(record.keyword) ||
                    new Date(record.rank_date) > new Date(keywordMap.get(record.keyword).rank_date)) {
                    keywordMap.set(record.keyword, record);
                }
            }
            return { keywords: Array.from(keywordMap.values()) };
        }
        catch (error) {
            request.log.error(error);
            reply.status(500).send({ error: 'Failed to fetch tracked keywords' });
        }
    });
    // Add keyword to tracking
    fastify.post('/keywords/track', async (request, reply) => {
        const { projectId, keyword, targetUrl } = request.body;
        try {
            // Fetch initial rank
            const rankData = await dataForSEO.getSerpRank(keyword, projectId);
            // Store in ClickHouse
            const { ClickHouseRankRepository } = await Promise.resolve().then(() => __importStar(require('@apexseo/shared')));
            const record = {
                site_id: projectId,
                keyword,
                rank_position: (rankData === null || rankData === void 0 ? void 0 : rankData.rank) || 0,
                url: (rankData === null || rankData === void 0 ? void 0 : rankData.url) || targetUrl || '',
                rank_date: new Date().toISOString().split('T')[0],
                search_volume: 0, // Will be updated by RankTracker workflow
                cpc: 0,
                serp_features: [],
                rank_volatility: 0,
                change_from_yesterday: 0
            };
            await ClickHouseRankRepository.insertRank(record);
            return { success: true, keyword, rank: (rankData === null || rankData === void 0 ? void 0 : rankData.rank) || 0 };
        }
        catch (error) {
            request.log.error(error);
            reply.status(500).send({ error: 'Failed to add keyword to tracking' });
        }
    });
    // Remove keyword from tracking
    fastify.delete('/keywords/track/:projectId/:keyword', async (request, reply) => {
        const { projectId, keyword } = request.params;
        try {
            // In ClickHouse, we don't delete but mark as inactive
            // For MVP, we'll just return success
            // In production, add a status column to rank_history
            return { success: true, message: 'Keyword removed from tracking' };
        }
        catch (error) {
            request.log.error(error);
            reply.status(500).send({ error: 'Failed to remove keyword' });
        }
    });
    // Semantic Analysis (LLM-based Clustering)
    fastify.post('/keywords/analysis/semantic', async (request, reply) => {
        const { seedKeyword, rawKeywords, serpData = [] } = request.body;
        if (!seedKeyword || !rawKeywords || rawKeywords.length === 0) {
            return reply.status(400).send({ error: 'seedKeyword and rawKeywords are required' });
        }
        try {
            const { ClusteringService } = await Promise.resolve().then(() => __importStar(require('@apexseo/shared')));
            const clusters = await ClusteringService.clusterKeywordsSemantically(seedKeyword, rawKeywords, serpData);
            return { clusters };
        }
        catch (error) {
            request.log.error(error);
            reply.status(500).send({ error: 'Failed to perform semantic analysis' });
        }
    });
    // Get Strategy Data
    fastify.get('/keywords/strategy/:keyword', async (request, reply) => {
        const { keyword } = request.params;
        // const { projectId } = request.query;
        try {
            // Fetch from Neo4j
            const { getDriver } = await Promise.resolve().then(() => __importStar(require('@apexseo/shared')));
            const driver = getDriver();
            if (!driver) {
                return reply.status(500).send({ error: 'Database unavailable' });
            }
            const session = driver.session();
            try {
                // Aggregate clusters for this seed keyword
                const res = await session.run(`
                        MATCH (c:Cluster {seed_keyword: $keyword})
                        OPTIONAL MATCH (k:Keyword)-[:BELONGS_TO_CLUSTER]->(c)
                        WITH c, collect(k.term) as keywords
                        RETURN c, keywords
                    `, { keyword: decodeURIComponent(keyword) }); // decode in case it was encoded in URL
                const clusters = res.records.map((r) => ({
                    name: r.get('c').properties.label,
                    search_volume_sum: r.get('c').properties.search_volume,
                    kd_score: r.get('c').properties.difficulty,
                    intent: r.get('c').properties.intent,
                    child_keywords: r.get('keywords'),
                    content_angle: r.get('c').properties.content_angle
                }));
                if (clusters.length === 0) {
                    // If not found in DB, return 404
                    // BUT, for user flow "Search -> Redirect", the cluster saving might be async or race condition?
                    // The persistence in ClusteringService is await, so it should be ready.
                    // Return empty structure if not found so UI doesn't crash
                }
                // Calculate stats
                const volume = clusters.reduce((acc, c) => { var _a; return acc + (((_a = c.search_volume_sum) === null || _a === void 0 ? void 0 : _a.low) || c.search_volume_sum || 0); }, 0);
                const avgKd = clusters.length > 0
                    ? Math.round(clusters.reduce((acc, c) => { var _a; return acc + (((_a = c.kd_score) === null || _a === void 0 ? void 0 : _a.low) || c.kd_score || 0); }, 0) / clusters.length)
                    : 0;
                // Dominant intent
                const intents = clusters.map((c) => c.intent);
                const dominantIntent = intents.sort((a, b) => intents.filter((v) => v === a).length - intents.filter((v) => v === b).length).pop() || 'Mixed';
                return {
                    keyword: decodeURIComponent(keyword),
                    volume,
                    difficulty: avgKd,
                    intent: dominantIntent,
                    clusters: clusters.map((c) => ({
                        name: c.name,
                        keywords: c.child_keywords
                    }))
                };
            }
            finally {
                await session.close();
            }
        }
        catch (error) {
            request.log.error(error);
            reply.status(500).send({ error: 'Failed to fetch strategy' });
        }
    });
};
exports.default = keywordsRoutes;
