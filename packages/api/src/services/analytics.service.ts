
import { logger } from '@apexseo/shared';

export interface SankeyNode {
    name: string;
}

export interface SankeyLink {
    source: number;
    target: number;
    value: number;
}

export interface FinancialFlowData {
    nodes: SankeyNode[];
    links: SankeyLink[];
}

export class AnalyticsService {

    // Mock data configuration for estimation
    private readonly COSTS = {
        INFRA: {
            GCP: 120,          // $120/mo fixed
            CLICKHOUSE: 85,    // $85/mo
            NEO4J: 65,         // $65/mo
            TEMPORAL: 40,      // $40/mo
        },
        API_PER_USER: {
            PERPLEXITY: 0.15,
            OPENAI: 0.40,
            DEEPSEEK: 0.10,
            SERPER: 0.25,
            DATAFORSEO: 0.20,
            APEXRANKER: 0.00, // Our own, mostly free
        },
        STRIPE_FEE_PERCENT: 0.029,
        STRIPE_FEE_FIXED: 0.30,
    };

    /**
     * Generates data for the Financial Flow Sankey Chart.
     * Logic: Revenue -> Expenses (Infra, APIs, Ops) -> Profit
     */
    async getFinancialFlow(): Promise<FinancialFlowData> {
        try {
            // 1. Calculate Revenue (Mock for now, normally fetch from Stripe)
            // Assuming 100 active users with avg $50 spend
            const activeUsers = 124;
            const avgRevenuePerUser = 65;
            const totalRevenue = activeUsers * avgRevenuePerUser; // $8060

            // 2. Calculate Costs
            // 2a. Payment Processing Fees
            const stripeFees = (totalRevenue * this.COSTS.STRIPE_FEE_PERCENT) + (activeUsers * this.COSTS.STRIPE_FEE_FIXED);

            // 2b. Infrastructure (Fixed)
            const infraCost =
                this.COSTS.INFRA.GCP +
                this.COSTS.INFRA.CLICKHOUSE +
                this.COSTS.INFRA.NEO4J +
                this.COSTS.INFRA.TEMPORAL;

            // 2c. API Costs (Variable based on users)
            const apiCosts = {
                perplexity: activeUsers * this.COSTS.API_PER_USER.PERPLEXITY, // ~$18.6
                openai: activeUsers * this.COSTS.API_PER_USER.OPENAI,         // ~$49.6
                deepseek: activeUsers * this.COSTS.API_PER_USER.DEEPSEEK,     // ~$12.4
                serper: activeUsers * this.COSTS.API_PER_USER.SERPER,         // ~$31
                dataforseo: activeUsers * this.COSTS.API_PER_USER.DATAFORSEO, // ~$24.8
                apexranker: activeUsers * this.COSTS.API_PER_USER.APEXRANKER, // $0
            };
            const totalApiCost = Object.values(apiCosts).reduce((a, b) => a + b, 0);

            // 3. Calculate Profit
            const totalExpenses = stripeFees + infraCost + totalApiCost;
            const netProfit = totalRevenue - totalExpenses;

            // 4. Construct Nodes & Links
            // Indices:
            // 0: Total Revenue
            // 1: Infrastructure
            // 2: API Costs
            // 3: Stripe Fees
            // 4: Net Profit
            // 5: GCP
            // 6: Clickhouse
            // 7: Neo4j
            // 8: Temporal
            // 9: Perplexity
            // 10: OpenAI
            // 11: Deepseek
            // 12: Serper.dev
            // 13: DataForSEO
            // 14: ApexRanker

            const nodes = [
                { name: 'Total Revenue' },      // 0
                { name: 'Infrastructure' },     // 1
                { name: 'API Usage' },          // 2
                { name: 'Stripe Fees' },        // 3
                { name: 'Net Profit' },         // 4
                { name: 'GCP' },                // 5
                { name: 'ClickHouse' },         // 6
                { name: 'Neo4j' },              // 7
                { name: 'Temporal' },           // 8
                { name: 'Perplexity API' },     // 9
                { name: 'OpenAI API' },         // 10
                { name: 'Deepseek API' },       // 11
                { name: 'Serper.dev' },         // 12
                { name: 'DataForSEO' },         // 13
                { name: 'ApexCloud (Native)' }, // 14
            ];

            const links = [
                // Revenue Distribution
                { source: 0, target: 1, value: infraCost },
                { source: 0, target: 2, value: totalApiCost },
                { source: 0, target: 3, value: stripeFees },
                { source: 0, target: 4, value: netProfit },

                // Infrastructure Breakdown
                { source: 1, target: 5, value: this.COSTS.INFRA.GCP },
                { source: 1, target: 6, value: this.COSTS.INFRA.CLICKHOUSE },
                { source: 1, target: 7, value: this.COSTS.INFRA.NEO4J },
                { source: 1, target: 8, value: this.COSTS.INFRA.TEMPORAL },

                // API Costs Breakdown
                { source: 2, target: 9, value: apiCosts.perplexity },
                { source: 2, target: 10, value: apiCosts.openai },
                { source: 2, target: 11, value: apiCosts.deepseek },
                { source: 2, target: 12, value: apiCosts.serper },
                { source: 2, target: 13, value: apiCosts.dataforseo },
                { source: 2, target: 14, value: 0.01 }, // Small non-zero value for rendering if free
            ];

            return { nodes, links };

        } catch (error) {
            logger.error('Failed to calculate financial flow', { error });
            throw error;
        }
    }
}
