'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { X, ExternalLink, Zap, BarChart3, Target, Layers, Globe } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface KeywordDetailsPanelProps {
    node: any;
    onClose: () => void;
    onGenerate: () => void;
}

export function KeywordDetailsPanel({ node, onClose, onGenerate }: KeywordDetailsPanelProps) {
    const data = node.data;
    const isCluster = node.type === 'cluster';

    // Mock Competitors if not present
    const competitors = data.competitors || ['competitor-a.com', 'competitor-b.com', 'competitor-c.com'];

    return (
        <div className="absolute top-6 right-6 w-[480px] bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl z-50 flex flex-col max-h-[calc(100vh-48px)] animate-in slide-in-from-right-4 duration-300">

            {/* Header */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-start justify-between bg-gray-50/50 dark:bg-gray-900/50 rounded-t-xl">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800 uppercase text-[10px] tracking-wider">
                            {isCluster ? 'Topic Cluster' : 'Keyword'}
                        </Badge>
                        {data.status === 'Not Covered' && (
                            <Badge variant="destructive" className="uppercase text-[10px] tracking-wider">Gap</Badge>
                        )}
                    </div>
                    <h2 className="text-xl font-bold leading-tight text-gray-900 dark:text-white pr-4">
                        {data.label}
                    </h2>
                    <p className="text-sm text-muted-foreground">Includes {data.raw?.relatedKeywords?.length || 0} keywords</p>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full">
                    <X className="w-4 h-4" />
                </Button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-px bg-gray-100 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-800">
                <div className="bg-white dark:bg-[#111] p-4 text-center">
                    <div className="text-[10px] uppercase text-muted-foreground font-semibold mb-1">Avg. Position</div>
                    <div className="text-lg font-bold">--</div>
                </div>
                <div className="bg-white dark:bg-[#111] p-4 text-center">
                    <div className="text-[10px] uppercase text-muted-foreground font-semibold mb-1">Keyword Difficulty</div>
                    <div className={`text-lg font-bold ${data.difficulty > 60 ? 'text-red-500' : 'text-green-500'}`}>
                        {data.difficulty}
                    </div>
                </div>
                <div className="bg-white dark:bg-[#111] p-4 text-center">
                    <div className="text-[10px] uppercase text-muted-foreground font-semibold mb-1">Search Volume</div>
                    <div className="text-lg font-bold">{data.volume?.toLocaleString()}</div>
                </div>
            </div>

            {/* Content Tabs */}
            <div className="flex-1 overflow-hidden flex flex-col">
                <Tabs defaultValue="keywords" className="flex-1 flex flex-col">
                    <div className="px-6 pt-4">
                        <TabsList className="w-full grid grid-cols-2">
                            <TabsTrigger value="keywords">Keywords ({data.raw?.relatedKeywords?.length || 0})</TabsTrigger>
                            <TabsTrigger value="competitors">Competitors ({competitors.length})</TabsTrigger>
                        </TabsList>
                    </div>

                    <ScrollArea className="flex-1 p-6">
                        <TabsContent value="keywords" className="mt-0 space-y-4">
                            {isCluster && data.raw?.relatedKeywords?.map((kw: string, i: number) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-mono text-muted-foreground">
                                            {i + 1}
                                        </div>
                                        <span className="font-medium text-sm">{kw}</span>
                                        {i === 0 && <Badge variant="secondary" className="text-[10px]">MAIN</Badge>}
                                    </div>
                                    <div className="text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="text-xs font-mono text-muted-foreground">KD {Math.floor(Math.random() * 100)}</div>
                                    </div>
                                </div>
                            ))}
                        </TabsContent>

                        <TabsContent value="competitors" className="mt-0 space-y-4">
                            {competitors.map((comp: string, i: number) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                                            <Globe className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-sm">{comp}</div>
                                            <div className="text-xs text-muted-foreground">Rank #{i + 1} • 45% Coverage</div>
                                        </div>
                                    </div>
                                    <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500" style={{ width: `${100 - (i * 15)}%` }} />
                                    </div>
                                </div>
                            ))}
                        </TabsContent>
                    </ScrollArea>
                </Tabs>
            </div>

            {/* Footer Action */}
            <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 rounded-b-xl">
                <Button
                    className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold shadow-lg shadow-purple-500/25 transition-all hover:scale-[1.02]"
                    onClick={onGenerate}
                >
                    <Zap className="w-4 h-4 mr-2 fill-current" />
                    Generate with ApexSEO AI
                </Button>
            </div>
        </div>
    );
}
