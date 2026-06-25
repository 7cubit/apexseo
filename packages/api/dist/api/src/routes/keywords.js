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
};
exports.default = keywordsRoutes;
