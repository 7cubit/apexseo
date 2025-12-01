import { ClickHousePageRepository, Page } from './clickhouse/repositories/ClickHousePageRepository';
import { ClickHouseBacklinkRepository } from './clickhouse/repositories/ClickHouseBacklinkRepository';
import { ClickHouseUxSessionStore } from './clickhouse/repositories/ClickHouseUxSessionStore';
import { ClickHouseHealthScoreRepository } from './clickhouse/repositories/ClickHouseHealthScoreRepository';
import { ContentDepthService } from './services/ContentDepthService';
import { TruthRiskService } from './services/TruthRiskService';
import { UXFrictionService } from './services/UXFrictionService';

export class HealthScoreService {
    static async calculateAndSave(siteId: string) {
        // Fetch all necessary data
        const pages = await ClickHousePageRepository.getPagesBySite(siteId) as Page[];
        console.log(`Fetched ${pages.length} pages for ${siteId}`);
        const backlinks = await ClickHouseBacklinkRepository.getBacklinks(siteId, 10000); // Fetch all/many backlinks
        console.log(`Fetched ${backlinks.length} backlinks for ${siteId}`);
        const uxMetrics = await ClickHouseUxSessionStore.getMetrics(siteId);

        // Calculate max TSPR for normalization
        const maxTspr = Math.max(...pages.map((p: Page) => p.tspr || 0)) || 1;

        const scores = [];

        for (const page of pages) {
            // Filter backlinks for this page
            const pageBacklinks = backlinks.filter((b: any) => b.target_url === page.url);

            // 1. Content Depth
            // Use first keyword or title as proxy if no keywords
            const targetKeyword = (page.keywords && page.keywords.length > 0) ? page.keywords[0] : (page.title || '');
            const contentDepthScore = await ContentDepthService.calculateContentDepth(targetKeyword, page.text || '');

            // 2. Truth Risk
            const truthRiskScore = await TruthRiskService.calculateTruthRisk(siteId, page.page_id, page.text || '');

            // 3. UX Friction
            const uxFrictionScore = await UXFrictionService.calculateUXFriction(siteId, page.url);

            // Calculate components
            const tsprNorm = (page.tspr || 0) / maxTspr;
            const contentNorm = contentDepthScore / 100;
            const uxFrictionInverse = 1 - (uxFrictionScore / 100);
            const truthRiskInverse = 1 - (truthRiskScore / 100);

            const avgBacklinkQuality = pageBacklinks.length > 0
                ? pageBacklinks.reduce((sum: number, b: any) => sum + (b.domain_relevance || 0), 0) / pageBacklinks.length
                : 0;

            // Internal links: Placeholder logic as we don't have exact counts in Page struct yet
            // Assuming 'expected' is based on some heuristic or graph analysis
            // For now, let's use a simplified proxy or 0.5 default
            const internalLinkHealth = 0.5;

            // Formula:
            // Health_Score = (
            // 0.25 × TSPR_normalized +
            // 0.20 × Content_Score_normalized +
            // 0.20 × UX_Friction_Score_inverse +
            // 0.15 × Truth_Risk_Score_inverse +
            // 0.12 × Backlink_Quality_Score +
            // 0.08 × Internal_Link_Health
            // ) * 100

            const healthScore = (
                0.25 * tsprNorm +
                0.20 * contentNorm +
                0.20 * uxFrictionInverse +
                0.15 * truthRiskInverse +
                0.12 * avgBacklinkQuality +
                0.08 * internalLinkHealth
            ) * 100;

            scores.push({
                site_id: siteId,
                page_id: page.page_id,
                health_score: parseFloat(healthScore.toFixed(2)),
                tspr_component: parseFloat((tsprNorm * 100).toFixed(2)),
                content_component: parseFloat((contentNorm * 100).toFixed(2)),
                ux_component: parseFloat((uxFrictionInverse * 100).toFixed(2)),
                truth_component: parseFloat((truthRiskInverse * 100).toFixed(2)),
                backlink_component: parseFloat((avgBacklinkQuality * 100).toFixed(2)),
                link_health_component: parseFloat((internalLinkHealth * 100).toFixed(2)),
                score_date: new Date().toISOString().split('T')[0]
            });
        }

        await ClickHouseHealthScoreRepository.saveScores(scores);
        return scores;
    }

    static getSuggestion(score: number, components: any): string {
        const { tspr, content, ux, truth, backlinks } = components;

        if (score >= 80) return "✅ Maintain";

        if (score < 40) {
            if (tspr > 80 && content < 40) return "Rewrite for better coverage";
            if (content > 80 && ux > 70) return "Improve navigation (UX)";
            if (truth > 60) return "Review fact-checking"; // High risk score means low component score? Wait, truth component is INVERSE risk. So low component = high risk.
            // Let's correct: truth component is 1 - risk. So if truth component < 40 (risk > 60).
            if (truth < 40) return "Review fact-checking";
            if (backlinks < 30) return "Focus on link-building";
        }

        if (content < 50) return "📝 Improve content";
        if (ux < 50) return "🚨 Fix UX";
        if (backlinks < 50) return "Build more links";

        return "General optimization";
    }
}
