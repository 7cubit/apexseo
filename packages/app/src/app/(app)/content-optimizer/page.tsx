"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { Editor } from '@/components/editor/Editor';

interface ContentScore {
    overall: number;
    wordCount: { current: number; target: number; score: number };
    keywordUsage: { count: number; density: number; target: number; score: number };
    readability: { score: number; grade: string };
    headers: { h2Count: number; h3Count: number; score: number };
    links: { internal: number; external: number; score: number };
    suggestions: string[];
}

export default function ContentOptimizerPage() {
    const [content, setContent] = useState('');
    const [targetKeyword, setTargetKeyword] = useState('');
    const [score, setScore] = useState<ContentScore | null>(null);
    const [loading, setLoading] = useState(false);

    // Debounced scoring
    useEffect(() => {
        if (!content || !targetKeyword) return;

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/content/score', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content, targetKeyword, siteId: 'example.com' })
                });
                const data = await res.json();
                setScore(data.score);
            } catch (error) {
                console.error('Failed to score content:', error);
            } finally {
                setLoading(false);
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [content, targetKeyword]);

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-500';
        if (score >= 60) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getScoreBadge = (score: number) => {
        if (score >= 80) return <Badge className="bg-green-500">Excellent</Badge>;
        if (score >= 60) return <Badge className="bg-yellow-500">Good</Badge>;
        return <Badge variant="destructive">Needs Work</Badge>;
    };

    return (
        <div className="container mx-auto py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Content Optimizer</h1>
                <p className="text-muted-foreground">Write SEO-optimized content with real-time scoring</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Editor - Left 2/3 */}
                <div className="lg:col-span-2 space-y-4">
                    <Card>
                        <CardHeader>
                            <Input
                                placeholder="Target Keyword (e.g., 'seo tools')"
                                value={targetKeyword}
                                onChange={(e) => setTargetKeyword(e.target.value)}
                                className="text-lg font-medium"
                            />
                        </CardHeader>
                        <CardContent>
                            <Editor
                                initialContent={content}
                                onChange={setContent}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Scoring Sidebar - Right 1/3 */}
                <div className="space-y-4">
                    {/* Overall Score */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Content Score</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between mb-2">
                                <span className={`text-4xl font-bold ${getScoreColor(score?.overall || 0)}`}>
                                    {score?.overall || 0}
                                </span>
                                {score && getScoreBadge(score.overall)}
                            </div>
                            <Progress value={score?.overall || 0} className="h-2" />
                        </CardContent>
                    </Card>

                    {/* Metrics */}
                    {score && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Metrics</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Word Count */}
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Word Count</span>
                                        <span className="font-medium">
                                            {score.wordCount.current} / {score.wordCount.target}
                                        </span>
                                    </div>
                                    <Progress value={score.wordCount.score} className="h-1" />
                                </div>

                                {/* Keyword Usage */}
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Keyword Density</span>
                                        <span className="font-medium">
                                            {score.keywordUsage.density.toFixed(2)}%
                                        </span>
                                    </div>
                                    <Progress value={score.keywordUsage.score} className="h-1" />
                                </div>

                                {/* Readability */}
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Readability</span>
                                        <span className="font-medium">{score.readability.grade}</span>
                                    </div>
                                    <Progress value={score.readability.score} className="h-1" />
                                </div>

                                {/* Headers */}
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Headers</span>
                                        <span className="font-medium">
                                            H2: {score.headers.h2Count}, H3: {score.headers.h3Count}
                                        </span>
                                    </div>
                                    <Progress value={score.headers.score} className="h-1" />
                                </div>

                                {/* Links */}
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Links</span>
                                        <span className="font-medium">
                                            Int: {score.links.internal}, Ext: {score.links.external}
                                        </span>
                                    </div>
                                    <Progress value={score.links.score} className="h-1" />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Suggestions */}
                    {score && score.suggestions.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Suggestions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {score.suggestions.map((suggestion, idx) => (
                                        <div key={idx} className="flex items-start gap-2 text-sm">
                                            <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                            <span>{suggestion}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
