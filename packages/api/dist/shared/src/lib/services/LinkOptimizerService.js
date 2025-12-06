"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkOptimizerService = void 0;
const ClickHousePageRepository_1 = require("../clickhouse/repositories/ClickHousePageRepository");
const ClickHouseLinkSuggestionRepository_1 = require("../clickhouse/repositories/ClickHouseLinkSuggestionRepository");
const neo4j_1 = require("../neo4j");
class LinkOptimizerService {
    static async generateSuggestions(siteId) {
        // 1. Find semantic orphans (pages isolated from their semantic cluster)
        const candidates = await ClickHousePageRepository_1.ClickHousePageRepository.getSemanticOrphans(siteId);
        const suggestions = [];
        for (const candidate of candidates) {
            // candidate: { page_id, url, suggested_targets: [url1, url2...] }
            for (const targetUrl of candidate.suggested_targets) {
                // Find target page ID
                const targetPageId = await ClickHousePageRepository_1.ClickHousePageRepository.getPageIdByUrl(siteId, targetUrl);
                if (targetPageId) {
                    // Calculate score (mock for now, but using real IDs)
                    const similarity = 0.85;
                    suggestions.push({
                        site_id: siteId,
                        source_page_id: candidate.page_id,
                        target_page_id: targetPageId,
                        source_url: candidate.url,
                        target_url: targetUrl,
                        similarity_score: similarity,
                        tspr_diff: 0.1, // Mock
                        cluster_id: 'cluster_1', // Mock
                        suggested_anchor: 'Learn more about ' + targetUrl.split('/').pop(),
                        reason: 'High semantic similarity',
                        status: 'pending',
                        created_at: new Date().toISOString()
                    });
                }
            }
        }
        await ClickHouseLinkSuggestionRepository_1.ClickHouseLinkSuggestionRepository.saveSuggestions(suggestions);
        return suggestions;
    }
    static async acceptSuggestion(siteId, suggestionId, anchorText) {
        // 1. Parse suggestion ID (assuming composite source:target)
        // Or better, fetch from CH if we had a unique ID. 
        // For now, let's assume the ID passed is "sourceId:targetId" as per API route
        const [sourceId, targetId] = suggestionId.split(':');
        if (!sourceId || !targetId)
            throw new Error("Invalid suggestion ID format");
        // 2. Create edge in Neo4j
        const driver = (0, neo4j_1.getDriver)();
        if (driver) {
            const session = driver.session();
            try {
                await session.run(`
                    MATCH (s:Page {page_id: $sourceId})
                    MATCH (t:Page {page_id: $targetId})
                    MERGE (s)-[r:LINKS_TO]->(t)
                    SET r.anchor = $anchorText, r.type = 'internal', r.created_at = datetime()
                    `, { sourceId, targetId, anchorText });
            }
            catch (error) {
                console.error("Error creating link in Neo4j:", error);
                // Don't throw, we still want to update CH status
            }
            finally {
                await session.close();
            }
        }
        // 3. Update status in ClickHouse
        await ClickHouseLinkSuggestionRepository_1.ClickHouseLinkSuggestionRepository.updateStatus(siteId, sourceId, targetId, 'accepted');
    }
    static async rejectSuggestion(siteId, suggestionId, reason) {
        const [sourceId, targetId] = suggestionId.split(':');
        if (!sourceId || !targetId)
            throw new Error("Invalid suggestion ID format");
        // Update status in ClickHouse to 'rejected'
        // We could also store the reason, but our updateStatus method currently only takes status.
        // Ideally we'd update the repo to accept reason, but for now let's just mark as rejected.
        await ClickHouseLinkSuggestionRepository_1.ClickHouseLinkSuggestionRepository.updateStatus(siteId, sourceId, targetId, 'rejected');
    }
}
exports.LinkOptimizerService = LinkOptimizerService;
