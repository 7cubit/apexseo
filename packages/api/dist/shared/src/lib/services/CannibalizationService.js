"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CannibalizationService = void 0;
const ClickHouseRankRepository_1 = require("../clickhouse/repositories/ClickHouseRankRepository");
class CannibalizationService {
    static async analyze(siteId, days = 7) {
        // Use the existing getCannibalizationCandidates method
        const candidates = await ClickHouseRankRepository_1.ClickHouseRankRepository.getCannibalizationCandidates(siteId, days);
        const issues = [];
        for (const candidate of candidates) {
            const pages = candidate.urls.map(url => ({
                url,
                rank: candidate.avg_rank,
                page_id: Buffer.from(url).toString('base64')
            })).sort((a, b) => a.rank - b.rank);
            // Determine priority based on best rank position
            const bestRank = candidate.best_rank;
            let priority = 'Low';
            if (bestRank <= 10) {
                priority = 'High'; // Top 10 cannibalization is critical
            }
            else if (bestRank <= 20) {
                priority = 'Medium';
            }
            issues.push({
                keyword: candidate.keyword,
                pages,
                priority,
                recommendation: `Consolidate content for "${candidate.keyword}" into the best-performing page and redirect or update other pages. Currently ${candidate.competing_pages} pages are competing.`
            });
        }
        return issues.sort((a, b) => {
            const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
    }
}
exports.CannibalizationService = CannibalizationService;
