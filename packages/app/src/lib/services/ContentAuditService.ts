export interface AuditPage {
    id: string;
    title: string;
    url: string;
    targetKeyword: string;
    currentRank: number;
    rankTrend: 'up' | 'down' | 'stable';
    trafficCurrent: number;
    trafficPrev: number;
    trafficChange: number; // Percentage
    contentScore: number; // 0-100
    lastUpdated: string;
    status: 'critical' | 'attention' | 'healthy';
}

export interface AuditSummary {
    totalPages: number;
    pagesNeedingUpdate: number;
    avgContentScore: number;
    trafficTrend: number; // Percentage
}

export interface RefreshRecommendation {
    type: 'outdated_info' | 'missing_section' | 'word_count' | 'internal_links' | 'competitor_gap';
    description: string;
    impact: 'high' | 'medium' | 'low';
    action: string;
}

export class ContentAuditService {
    async getAuditReport(projectId: string): Promise<{ pages: AuditPage[], summary: AuditSummary }> {
        // Mock Data
        const pages: AuditPage[] = [
            {
                id: 'p1',
                title: 'Ultimate Guide to Kyoto Travel',
                url: '/blog/kyoto-guide',
                targetKeyword: 'kyoto travel guide',
                currentRank: 3,
                rankTrend: 'stable',
                trafficCurrent: 15000,
                trafficPrev: 14500,
                trafficChange: 3.4,
                contentScore: 92,
                lastUpdated: '2023-11-15',
                status: 'healthy'
            },
            {
                id: 'p2',
                title: 'Best Sushi in Tokyo 2023',
                url: '/blog/tokyo-sushi',
                targetKeyword: 'best sushi tokyo',
                currentRank: 12,
                rankTrend: 'down',
                trafficCurrent: 4500,
                trafficPrev: 6000,
                trafficChange: -25,
                contentScore: 65,
                lastUpdated: '2023-01-10', // Old
                status: 'critical'
            },
            {
                id: 'p3',
                title: 'Japan Rail Pass Explained',
                url: '/guides/jr-pass',
                targetKeyword: 'jr pass guide',
                currentRank: 5,
                rankTrend: 'up',
                trafficCurrent: 8000,
                trafficPrev: 7200,
                trafficChange: 11.1,
                contentScore: 88,
                lastUpdated: '2023-09-20',
                status: 'healthy'
            },
            {
                id: 'p4',
                title: 'Ryokan Etiquette',
                url: '/culture/ryokan-etiquette',
                targetKeyword: 'ryokan rules',
                currentRank: 8,
                rankTrend: 'stable',
                trafficCurrent: 1200,
                trafficPrev: 1150,
                trafficChange: 4.3,
                contentScore: 72,
                lastUpdated: '2023-05-01', // > 6 months
                status: 'attention'
            },
            {
                id: 'p5',
                title: 'Top 10 Osaka Street Foods',
                url: '/blog/osaka-food',
                targetKeyword: 'osaka street food',
                currentRank: 22,
                rankTrend: 'down',
                trafficCurrent: 800,
                trafficPrev: 1500,
                trafficChange: -46.6,
                contentScore: 55,
                lastUpdated: '2022-12-01',
                status: 'critical'
            }
        ];

        const summary: AuditSummary = {
            totalPages: 342,
            pagesNeedingUpdate: 87,
            avgContentScore: 78,
            trafficTrend: 12
        };

        return { pages, summary };
    }

    async analyzeContentRefresh(pageId: string): Promise<RefreshRecommendation[]> {
        // Mock AI Analysis
        // In real app: Fetch page content, fetch SERP, ask GPT-4 for gaps
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay

        return [
            {
                type: 'outdated_info',
                description: 'The article mentions "2023 prices" which are likely outdated.',
                impact: 'high',
                action: 'Update all price references to 2024 standards.'
            },
            {
                type: 'missing_section',
                description: 'Competitors (Rank #1-3) all have a "Vegetarian Options" section.',
                impact: 'medium',
                action: 'Draft a new section on vegetarian-friendly options.'
            },
            {
                type: 'internal_links',
                description: 'You have published 3 new related articles since this was last updated.',
                impact: 'medium',
                action: 'Add links to "Kyoto Temples" and "Nara Day Trip".'
            },
            {
                type: 'word_count',
                description: 'Current length (1,200 words) is below the top 3 average (2,500 words).',
                impact: 'low',
                action: 'Expand the "History" and "Getting There" sections.'
            }
        ];
    }
}
