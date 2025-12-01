import { ClickHouseRankRepository } from './clickhouse/repositories/ClickHouseRankRepository';

export interface CannibalizationIssue {
    keyword: string;
    competing_pages: number;
    urls: string[];
    avg_rank: number;
    best_rank: number;
    worst_rank: number;
    score: number;
    priority: 'High' | 'Medium' | 'Low';
    recommendation: string;
}

interface CannibalizationCandidate {
    keyword: string;
    competing_pages: number;
    urls: string[];
    avg_rank: number;
    best_rank: number;
    worst_rank: number;
}

export class CannibalizationService {
    static async analyze(siteId: string): Promise<CannibalizationIssue[]> {
        const candidates = await ClickHouseRankRepository.getCannibalizationCandidates(siteId) as CannibalizationCandidate[];
        const issues: CannibalizationIssue[] = [];

        for (const candidate of candidates) {
            const score = this.calculateScore(candidate.competing_pages, candidate.avg_rank);
            const priority = this.getPriority(score);
            const recommendation = this.generateRecommendation(candidate);

            issues.push({
                keyword: candidate.keyword,
                competing_pages: candidate.competing_pages,
                urls: candidate.urls,
                avg_rank: candidate.avg_rank,
                best_rank: candidate.best_rank,
                worst_rank: candidate.worst_rank,
                score: parseFloat(score.toFixed(2)),
                priority,
                recommendation
            });
        }

        // Sort by score descending (highest priority first)
        return issues.sort((a, b) => b.score - a.score);
    }

    private static calculateScore(competingPages: number, avgRank: number): number {
        // Formula: cannib_score = (1 - (1 / competing_pages)) * (avg_rank / 100)
        // Note: avg_rank / 100 implies higher rank (worse position) increases score?
        // Let's check the logic.
        // If competing_pages = 2, term1 = 0.5.
        // If avg_rank = 10 (good), term2 = 0.1. Score = 0.05.
        // If avg_rank = 90 (bad), term2 = 0.9. Score = 0.45.
        // So this formula prioritizes "many pages ranking poorly".
        // High score = Bad cannibalization (many pages, bad ranks).
        // Low score = Good? Or less urgent?
        // "High: score > 0.7 (multiple pages, mediocre ranks)"
        // If pages=5 (term1=0.8), avg_rank=90 (term2=0.9) -> Score = 0.72.
        // If pages=2 (term1=0.5), avg_rank=50 (term2=0.5) -> Score = 0.25.

        if (competingPages <= 1) return 0;
        return (1 - (1 / competingPages)) * (avgRank / 100);
    }

    private static getPriority(score: number): 'High' | 'Medium' | 'Low' {
        if (score > 0.7) return 'High';
        if (score >= 0.4) return 'Medium';
        return 'Low';
    }

    private static generateRecommendation(candidate: CannibalizationCandidate): string {
        const { competing_pages, best_rank, worst_rank } = candidate;

        if (competing_pages === 2) {
            return "Consider redirect: low-value page → high-rank page";
        }
        if (competing_pages >= 3) {
            return "Consolidate: Merge all into one pillar page";
        }
        // best_rank < 10 (Top 10) AND worst_rank > 20 (Below Top 20)
        if (best_rank < 10 && worst_rank > 20) {
            return "Add internal link from #1 → others to consolidate authority";
        }

        return "Review content strategy";
    }
}
