import { create } from 'zustand';
import { Activity, Target, Eye, FileText, ShieldCheck, Link as LinkIcon, Zap } from 'lucide-react';

// Types
export interface KPI {
    label: string;
    value: string;
    change: string;
    trend: 'up' | 'down' | 'neutral';
    icon: any;
    color: string;
    bg: string;
    link: string;
    sub: string;
}

export interface Task {
    name: string;
    status: 'running' | 'queued' | 'completed' | 'failed';
    progress?: number;
    nextRun?: string;
    lastRun?: string;
    type: 'audit' | 'rank' | 'content';
}

export interface BYOKState {
    openai: { active: boolean; cost: number };
    perplexity: { active: boolean; cost: number };
    anthropic: { active: boolean; cost: number };
}

export interface AIRecommendation {
    id: string;
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    action: string;
    cost: string;
}

interface DashboardState {
    kpis: KPI[];
    tasks: Task[];
    byok: BYOKState;
    aiRecommendations: AIRecommendation[];
    brandVoice: string;
    isLoading: boolean;
    fetchDashboardData: () => Promise<void>;
    setBrandVoice: (voice: string) => void;
}

// Initial Mock Data
const initialKPIs: KPI[] = [
    { label: 'Organic Traffic', value: '12,450', change: '+12.5%', trend: 'up', icon: Activity, color: 'text-blue-500', bg: 'bg-blue-500/10', link: '/performance', sub: 'Visits / mo' },
    { label: 'Keyword Opportunity', value: '87', change: '+5', trend: 'up', icon: Target, color: 'text-purple-500', bg: 'bg-purple-500/10', link: '/rank-tracker', sub: 'High Impact' },
    { label: 'Content Decay', value: '3', change: '-2', trend: 'down', icon: FileText, color: 'text-red-500', bg: 'bg-red-500/10', link: '/audit', sub: 'Pages Declining' },
    { label: 'Rank Volatility', value: 'High', change: '8.5/10', trend: 'neutral', icon: Activity, color: 'text-orange-500', bg: 'bg-orange-500/10', link: '/rank-tracker', sub: 'SERP Turbulence' },
    { label: 'Site Health', value: '94', change: '0', trend: 'neutral', icon: ShieldCheck, color: 'text-green-500', bg: 'bg-green-500/10', link: '/audit', sub: 'Technical Score' },
    { label: 'Content Velocity', value: '12', change: '+20%', trend: 'up', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/10', link: '/workflows', sub: 'Articles this week' },
];

const initialTasks: Task[] = [
    { name: 'Site Audit', status: 'running', progress: 45, type: 'audit' },
    { name: 'Rank Tracker', status: 'queued', nextRun: 'Tonight · 2:00 AM', type: 'rank' },
    { name: 'Content Analysis', status: 'completed', lastRun: '2h ago', type: 'content' },
];

const initialAIRecommendations: AIRecommendation[] = [
    { id: '1', title: 'Improve Keyword Coverage', description: 'Missing "SaaS Pricing" terms on Pricing Page', impact: 'high', action: 'Optimize', cost: '$0.02' },
    { id: '2', title: 'Rewrite Intro', description: 'Low engagement detected on "Home Page"', impact: 'high', action: 'Rewrite', cost: '$0.01' },
    { id: '3', title: 'Add FAQ Section', description: 'Competitors have FAQs for "Enterprise SEO"', impact: 'medium', action: 'Generate', cost: '$0.05' },
];

const initialBYOK: BYOKState = {
    openai: { active: true, cost: 1.24 },
    perplexity: { active: true, cost: 0.50 },
    anthropic: { active: false, cost: 0.00 }
};

export const useDashboardStore = create<DashboardState>((set) => ({
    kpis: initialKPIs,
    tasks: initialTasks,
    byok: initialBYOK,
    aiRecommendations: initialAIRecommendations,
    brandVoice: 'Professional', // Default value
    isLoading: false,
    fetchDashboardData: async () => {
        set({ isLoading: true });
        try {
            // Fetch BYOK Status
            const byokRes = await fetch('/api/status/byok');
            if (byokRes.ok) {
                const byokData = await byokRes.json();
                set({ byok: byokData });
            }

            // Simulate other data fetching (keep mock for now)
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        }
        set({ isLoading: false });
    },
}));
