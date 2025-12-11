'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TopicGraph } from './TopicGraph';
import { TopicTable } from './TopicTable';
import { KeywordDetailsPanel } from './KeywordDetailsPanel';
import { TopicMap } from '@/lib/TopicalMapService';
import { CompetitorGapAnalysis } from './CompetitorGapAnalysis';
import { SemanticSetupWizard } from './SemanticSetupWizard';
import { Search, RefreshCw, Filter, LayoutGrid, Table as TableIcon, Loader2, Sparkles, BarChart3, Globe, Target, ArrowRight, PlayCircle, Swords } from 'lucide-react';

// --- Components ---

const ResearchHero = ({ onSearch, loading }: { onSearch: (term: string) => void, loading: boolean }) => {
    const [term, setTerm] = useState('');

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white relative overflow-hidden">
            {/* Background Accents */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <div className="relative z-10 max-w-3xl w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="space-y-4">
                    <h4 className="text-purple-400 font-semibold tracking-wider text-sm uppercase">Topical Map Intelligence</h4>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400">
                        Find Your Next <br /> Content Ideas
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Save hours of researching with AI-driven Topical Map recommendations.
                        Get straight-to-the-point content ideas your audience and Google will love.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto w-full">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                            value={term}
                            onChange={(e) => setTerm(e.target.value)}
                            placeholder="Enter a seed keyword (e.g. 'wordpress seo')"
                            className="h-12 pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-500 rounded-xl focus:ring-purple-500 focus:border-purple-500"
                            onKeyDown={(e) => e.key === 'Enter' && onSearch(term)}
                        />
                    </div>
                    <Button
                        onClick={() => onSearch(term)}
                        disabled={loading || !term}
                        className="h-12 px-8 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/25 transition-all hover:scale-105 w-full sm:w-auto"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Start Research <ArrowRight className="w-5 h-5 ml-2" /></>}
                    </Button>
                </div>

                <div className="flex items-center justify-center gap-6 pt-8 text-sm text-gray-500">
                    <button className="flex items-center gap-2 hover:text-white transition-colors">
                        <PlayCircle className="w-4 h-4" /> Watch Explainer
                    </button>
                    <span>•</span>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span>Neo4j Graph Ready</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatsCard = ({ label, value, subtext, icon: Icon, color }: any) => (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 rounded-xl shadow-sm flex items-start justify-between">
        <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
            <h3 className="text-2xl font-bold">{value}</h3>
            {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
        </div>
        <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
            <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
        </div>
    </div>
);

// --- Main Dashboard ---

import { useRouter } from 'next/navigation';

export function TopicalMapDashboard() {
    const router = useRouter();
    const [seedKeyword, setSeedKeyword] = useState('');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<TopicMap | null>(null);
    const [selectedNode, setSelectedNode] = useState<any>(null);
    const [view, setView] = useState<'graph' | 'table' | 'gap'>('graph');

    // Filters
    const [minVolume, setMinVolume] = useState([0]);
    const [maxDifficulty, setMaxDifficulty] = useState([100]);

    const handleSearch = async (term: string = seedKeyword) => {
        if (!term) return;
        setSeedKeyword(term);
        setLoading(true);
        setSelectedNode(null);
        try {
            const res = await fetch('/api/research/clusters', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ seedKeyword: term, projectId: 'current-project-id' })
            });
            const json = await res.json();
            setData(json);
        } catch (e) {
            console.error("Failed to fetch clusters", e);
        } finally {
            setLoading(false);
        }
    };

    const handleSemanticAnalysis = async (seed: string, rawKeywords: string[]) => {
        setLoading(true);
        try {
            const res = await fetch('/api/keywords/analysis/semantic', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    seedKeyword: seed,
                    rawKeywords,
                    serpData: [] // TODO: Let backend fetch or pass if available
                })
            });
            const json = await res.json();
            // Mock projectId for now, should come from context/props
            const projectId = 'current-project-id';

            // Navigate to the new Strategy View
            router.push(`/projects/${projectId}/research/${encodeURIComponent(seed)}`);

        } catch (e) {
            console.error("Semantic analysis failed", e);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = (cluster: any) => {
        console.log("Generate content for:", cluster);
    };

    // Calculate stats
    const totalKeywords = data ? data.clusters.reduce((acc, c) => acc + c.relatedKeywords.length + 1, 0) : 0;
    const totalVolume = data ? data.clusters.reduce((acc, c) => acc + c.searchVolume, 0) : 0;
    const avgDifficulty = data ? Math.round(data.clusters.reduce((acc, c) => acc + c.difficulty, 0) / data.clusters.length) : 0;

    if (!data && !loading) {
        return <ResearchHero onSearch={handleSearch} loading={loading} />;
    }

    return (
        <div className="flex h-screen w-full bg-background overflow-hidden">
            {/* LEFT SIDEBAR */}
            <div className="w-[280px] border-r bg-card flex flex-col p-4 space-y-6 z-20 shadow-xl">
                <div className="space-y-1">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase">Project</Label>
                    <div className="font-medium truncate">ApexSEO Marketing</div>
                </div>

                <div className="space-y-3">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase">Research Context</Label>
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
                        <Input
                            value={seedKeyword}
                            onChange={e => setSeedKeyword(e.target.value)}
                            className="pl-8"
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <Button onClick={() => handleSearch()} disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                        Update Map
                    </Button>
                </div>

                <div className="space-y-6 border-t pt-6">
                    <div className="flex items-center gap-2 font-medium text-sm">
                        <Filter className="w-4 h-4" /> Filters
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between text-xs">
                            <span>Min Volume</span>
                            <span className="font-mono">{minVolume[0]}</span>
                        </div>
                        <input
                            type="range"
                            value={minVolume[0]}
                            onChange={(e) => setMinVolume([parseInt(e.target.value)])}
                            max={10000}
                            step={100}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between text-xs">
                            <span>Max Difficulty</span>
                            <span className="font-mono">{maxDifficulty[0]}</span>
                        </div>
                        <input
                            type="range"
                            value={maxDifficulty[0]}
                            onChange={(e) => setMaxDifficulty([parseInt(e.target.value)])}
                            max={100}
                            step={1}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                        />
                    </div>

                    <div className="space-y-3">
                        <Label className="text-xs">Coverage Status</Label>
                        <div className="space-y-2">
                            {['Not Covered', 'Partially Covered', 'Fully Covered'].map(status => (
                                <div key={status} className="flex items-center space-x-2">
                                    <input type="checkbox" id={status} className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                                    <label htmlFor={status} className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        {status}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN AREA */}
            <div className="flex-1 flex flex-col relative bg-gray-50 dark:bg-black">
                {/* Stats Bar */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <StatsCard
                        label="Total Keywords"
                        value={totalKeywords.toLocaleString()}
                        subtext={`${data?.clusters.length} Clusters`}
                        icon={Target}
                        color="bg-blue-500 text-blue-500"
                    />
                    <StatsCard
                        label="Total Volume"
                        value={totalVolume.toLocaleString()}
                        subtext="Monthly Searches"
                        icon={BarChart3}
                        color="bg-purple-500 text-purple-500"
                    />
                    <StatsCard
                        label="Avg. Difficulty"
                        value={avgDifficulty}
                        subtext="Keyword Difficulty"
                        icon={Sparkles}
                        color="bg-yellow-500 text-yellow-500"
                    />
                    <StatsCard
                        label="Content Ideas"
                        value={data?.clusters.length}
                        subtext="Ready to Generate"
                        icon={Globe}
                        color="bg-green-500 text-green-500"
                    />
                </div>

                {/* Toolbar */}
                <div className="px-6 pb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 bg-white dark:bg-gray-900 p-1 rounded-lg border shadow-sm">
                        <Button
                            variant={view === 'graph' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setView('graph')}
                            className="text-xs"
                        >
                            <LayoutGrid className="w-3 h-3 mr-2" /> Graph View
                        </Button>
                        <Button
                            variant={view === 'table' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setView('table')}
                            className="text-xs"
                        >
                            <TableIcon className="w-3 h-3 mr-2" /> Table View
                        </Button>
                        <Button
                            variant={view === 'gap' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setView('gap')}
                            className="text-xs"
                        >
                            <Swords className="w-3 h-3 mr-2" /> Gap Analysis
                        </Button>
                        <div className="h-4 w-px bg-gray-200 dark:bg-gray-800 mx-2" />
                        <Link href="/content/editor">
                            <Button variant="ghost" size="sm" className="text-xs">
                                <Sparkles className="w-3 h-3 mr-2" /> Content Editor
                            </Button>
                        </Link>
                    </div>
                    <Button variant="outline" size="sm" className="text-xs">
                        Export Report
                    </Button>
                    <div className="ml-2">
                        <SemanticSetupWizard onAnalyze={handleSemanticAnalysis} loading={loading} />
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden relative px-6 pb-6">
                    <div className="h-full bg-white dark:bg-gray-900 rounded-xl border shadow-sm overflow-hidden relative">
                        {loading ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/50 z-50 backdrop-blur-sm">
                                <div className="flex flex-col items-center gap-4">
                                    <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                                    <p className="text-sm font-medium text-muted-foreground">Analyzing SERPs & Clustering Topics...</p>
                                </div>
                            </div>
                        ) : null}

                        {view === 'graph' ? (
                            <TopicGraph data={data} onNodeClick={setSelectedNode} />
                        ) : view === 'table' ? (
                            <div className="p-0 h-full overflow-auto">
                                <TopicTable data={data} onGenerate={handleGenerate} />
                            </div>
                        ) : (
                            <CompetitorGapAnalysis />
                        )}
                    </div>

                    {/* Right Panel Overlay */}
                    {selectedNode && (
                        <KeywordDetailsPanel
                            node={selectedNode}
                            onClose={() => setSelectedNode(null)}
                            onGenerate={() => handleGenerate(selectedNode.data)}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
