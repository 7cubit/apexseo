export interface CompetingPage {
    id: string;
    url: string;
    title: string;
    currentRank: number;
    wordCount: number;
    lastUpdated: string;
    traffic: number;
}

export interface CannibalizationIssue {
    keyword: string;
    pageCount: number;
    volume: number;
    bestRank: number;
    pages: CompetingPage[];
    status: 'critical' | 'warning' | 'safe';
}

export interface VolatilityPoint {
    date: string;
    rank: number;
}

export interface VolatilityData {
    keyword: string;
    score: number; // 0-100
    trend: 'stable' | 'fluctuating' | 'dropping';
    history: VolatilityPoint[];
}

// New Interfaces for Resolution Algorithm
export interface PageStrength {
    url: string;
    strengthScore: number; // 0-100
    factors: {
        keywordInTitle: boolean;
        contentDepthScore: number;
        backlinksCount: number;
        trafficScore: number;
        freshnessScore: number;
    };
    uniqueContent?: string[];
}

export interface ResolutionAction {
    url: string;
    action: 'noindex' | 'merge' | 'differentiate' | 'keep';
    reason: string;
    uniqueSections?: string[];
    targetKeyword?: string;
}

export interface ResolutionPlan {
    strategy: 'NOINDEX_WEAK' | 'MERGE' | 'DIFFERENTIATE';
    primaryUrl: string;
    actions: ResolutionAction[];
}

export class CannibalizationService {
    async getCannibalizationReport(projectId: string): Promise<CannibalizationIssue[]> {
        // Mock Data
        return [
            {
                keyword: 'wordpress security',
                pageCount: 3,
                volume: 12000,
                bestRank: 4,
                status: 'critical',
                pages: [
                    { id: 'p1', url: '/blog/wordpress-security-guide', title: 'Ultimate Guide to WordPress Security', currentRank: 4, wordCount: 2500, lastUpdated: '2023-10-15', traffic: 1200 },
                    { id: 'p2', url: '/blog/secure-wordpress-site', title: 'How to Secure Your WordPress Site', currentRank: 12, wordCount: 1200, lastUpdated: '2023-08-01', traffic: 150 },
                    { id: 'p3', url: '/features/security', title: 'Security Features', currentRank: 25, wordCount: 800, lastUpdated: '2023-01-20', traffic: 50 }
                ]
            },
            {
                keyword: 'seo audit checklist',
                pageCount: 2,
                volume: 5400,
                bestRank: 8,
                status: 'warning',
                pages: [
                    { id: 'p4', url: '/blog/seo-audit-checklist', title: 'Complete SEO Audit Checklist', currentRank: 8, wordCount: 3000, lastUpdated: '2023-11-01', traffic: 800 },
                    { id: 'p5', url: '/resources/audit-template', title: 'Free SEO Audit Template', currentRank: 15, wordCount: 500, lastUpdated: '2023-09-10', traffic: 200 }
                ]
            },
            {
                keyword: 'link building strategies',
                pageCount: 1,
                volume: 3200,
                bestRank: 2,
                status: 'safe',
                pages: [
                    { id: 'p6', url: '/blog/link-building', title: '10 Link Building Strategies', currentRank: 2, wordCount: 4000, lastUpdated: '2023-12-01', traffic: 2500 }
                ]
            }
        ];
    }

    async getVolatilityData(keyword: string): Promise<VolatilityData> {
        // Mock Data
        return {
            keyword,
            score: 75,
            trend: 'dropping',
            history: Array.from({ length: 30 }, (_, i) => ({
                date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                rank: Math.floor(Math.random() * 5) + 5 + (i > 20 ? i - 20 : 0) // Simulate drop at end
            }))
        };
    }

    // --- New Intelligent Resolution Algorithm ---

    async resolveKeywordCannibalization(
        keyword: string,
        competingUrls: string[]
    ): Promise<ResolutionPlan> {
        // Step 1: Analyze each competing page
        const analyses = await Promise.all(
            competingUrls.map(url => this.analyzePageStrength(url, keyword))
        );

        // Step 2: Rank pages by strength
        const ranked = analyses.sort((a, b) => b.strengthScore - a.strengthScore);
        const primaryPage = ranked[0];
        const secondaryPages = ranked.slice(1);

        // Step 3: Determine resolution strategy
        if (primaryPage.strengthScore > 70 && secondaryPages.every(p => p.strengthScore < 40)) {
            // Clear winner: Noindex others
            return {
                strategy: 'NOINDEX_WEAK',
                primaryUrl: primaryPage.url,
                actions: secondaryPages.map(p => ({
                    url: p.url,
                    action: 'noindex',
                    reason: 'Significantly weaker than primary page (Score < 40 vs > 70)'
                }))
            };
        } else if (secondaryPages.some(p => p.strengthScore > 60)) {
            // Multiple strong pages: Merge
            return {
                strategy: 'MERGE',
                primaryUrl: primaryPage.url,
                actions: secondaryPages.map(p => ({
                    url: p.url,
                    action: 'merge',
                    reason: 'Strong content (Score > 60), should be consolidated into primary',
                    uniqueSections: p.uniqueContent // Extract non-duplicate paragraphs
                }))
            };
        } else {
            // Similar strength or all weak: Differentiate
            const diffActions = await this.suggestAlternativeKeywords(secondaryPages, keyword);
            return {
                strategy: 'DIFFERENTIATE',
                primaryUrl: primaryPage.url,
                actions: diffActions
            };
        }
    }

    async analyzePageStrength(url: string, keyword: string): Promise<PageStrength> {
        // In a real implementation, this would fetch data from Neo4j, ClickHouse, and DataForSEO
        // For now, we simulate scores based on URL patterns or random logic for demo

        const isBlog = url.includes('/blog/');
        const isGuide = url.includes('guide');

        // Mock scoring logic
        const keywordInTitle = true; // Assume true for conflicts
        const contentDepthScore = isGuide ? 90 : isBlog ? 70 : 40;
        const backlinksCount = Math.floor(Math.random() * 50);
        const trafficScore = Math.floor(Math.random() * 100);
        const freshnessScore = Math.floor(Math.random() * 100);

        // Weighted Score Calculation
        // Title: 20, Depth: 20, Backlinks: 20, Traffic: 20, Freshness: 20
        const strengthScore = (
            (keywordInTitle ? 20 : 0) +
            (contentDepthScore * 0.2) +
            (Math.min(backlinksCount, 100) * 0.2) +
            (trafficScore * 0.2) +
            (freshnessScore * 0.2)
        );

        return {
            url,
            strengthScore: Math.round(strengthScore),
            factors: {
                keywordInTitle,
                contentDepthScore,
                backlinksCount,
                trafficScore,
                freshnessScore
            },
            uniqueContent: ['Unique section about X', 'Case study Y'] // Mock unique content
        };
    }

    async suggestAlternativeKeywords(pages: PageStrength[], currentKeyword: string): Promise<ResolutionAction[]> {
        // Mock keyword suggestions
        return pages.map(p => ({
            url: p.url,
            action: 'differentiate',
            reason: 'Content is unique enough to target a different intent',
            targetKeyword: `${currentKeyword} for beginners` // Mock suggestion
        }));
    }
}
