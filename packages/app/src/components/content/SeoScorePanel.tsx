'use client';

import React from 'react';
import { useEditorStore } from '@/stores/editorStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, XCircle, ChevronRight, HelpCircle, Info } from 'lucide-react';

// --- Sub-Components ---

const ScoreGauge = ({ score }: { score: number }) => {
    // Semi-circle gauge
    const radius = 70;
    const stroke = 12;
    const normalizedScore = Math.min(100, Math.max(0, score));
    const circumference = Math.PI * radius; // Semi-circle
    const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

    let color = 'text-red-500';
    if (score >= 50) color = 'text-yellow-500';
    if (score >= 75) color = 'text-green-500';

    return (
        <div className="relative w-48 h-28 flex flex-col items-center justify-end overflow-hidden">
            <svg className="w-full h-full" viewBox="0 0 160 85">
                {/* Background Track */}
                <path
                    d="M 10 80 A 70 70 0 0 1 150 80"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    className="text-gray-100 dark:text-gray-800"
                />
                {/* Score Progress */}
                <path
                    d="M 10 80 A 70 70 0 0 1 150 80"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className={`${color} transition-all duration-1000 ease-out`}
                />
            </svg>
            <div className="absolute bottom-0 flex flex-col items-center mb-2">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">{score}</span>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Content Score</span>
            </div>
        </div>
    );
};

const GuidelinesTab = () => {
    const { keywords } = useEditorStore();

    return (
        <ScrollArea className="h-full">
            <div className="p-4 space-y-6">
                <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase text-gray-500 tracking-wider">NLP Terms</h4>
                    <div className="space-y-2">
                        {keywords.map((k, i) => (
                            <div key={i} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 group transition-colors">
                                <span className={`text-sm font-medium ${k.status === 'optimal' ? 'text-green-700 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                    {k.keyword}
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${k.status === 'optimal' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                        k.status === 'overused' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                            'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                                        }`}>
                                        {k.count}/{k.target}
                                    </span>
                                    <div className="w-4 h-4 flex items-center justify-center">
                                        {k.status === 'optimal' && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
                                        {k.status === 'missing' && <AlertCircle className="w-3.5 h-3.5 text-gray-300 group-hover:text-red-400 transition-colors" />}
                                        {k.status === 'overused' && <AlertCircle className="w-3.5 h-3.5 text-yellow-500" />}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </ScrollArea>
    );
};

const OutlineTab = () => {
    const { headings } = useEditorStore();

    return (
        <ScrollArea className="h-full">
            <div className="p-4 space-y-6">
                <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase text-gray-500 tracking-wider">Heading Structure</h4>
                    <div className="space-y-3">
                        {headings.map((h, i) => (
                            <div key={i} className="flex items-start gap-3 text-sm">
                                <div className={`mt-0.5 ${h.present ? 'text-green-500' : 'text-gray-300'}`}>
                                    {h.present ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                </div>
                                <div className="flex-1">
                                    <p className={`font-medium ${h.present ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500'}`}>{h.text}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">Recommended H{h.level}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </ScrollArea>
    );
};

const BriefTab = () => {
    const { title, metaDescription, primaryKeyword, wordCount, targetWordCount, facts } = useEditorStore();

    const titleLength = title.length;
    const descLength = metaDescription.length;
    const hasKeywordInTitle = title.toLowerCase().includes(primaryKeyword.toLowerCase());

    return (
        <ScrollArea className="h-full">
            <div className="p-4 space-y-8">
                {/* Meta Data Feedback */}
                <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase text-gray-500 tracking-wider">Meta Data</h4>

                    {/* Title Check */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm font-medium">
                            <span>Title Length</span>
                            <span className={titleLength >= 30 && titleLength <= 60 ? 'text-green-600' : 'text-yellow-600'}>
                                {titleLength}/60 chars
                            </span>
                        </div>
                        <Progress value={Math.min(100, (titleLength / 60) * 100)} className="h-1.5" />
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {hasKeywordInTitle ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <XCircle className="w-3 h-3 text-red-500" />}
                            <span>Contains primary keyword</span>
                        </div>
                    </div>

                    {/* Description Check */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm font-medium">
                            <span>Description Length</span>
                            <span className={descLength >= 120 && descLength <= 160 ? 'text-green-600' : 'text-yellow-600'}>
                                {descLength}/160 chars
                            </span>
                        </div>
                        <Progress value={Math.min(100, (descLength / 160) * 100)} className="h-1.5" />
                    </div>
                </div>

                {/* Word Count */}
                <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase text-gray-500 tracking-wider">Content Length</h4>
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg flex items-center justify-between">
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{wordCount}</p>
                            <p className="text-xs text-muted-foreground">Current Words</p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-gray-500">{targetWordCount}</p>
                            <p className="text-xs text-muted-foreground">Target Words</p>
                        </div>
                    </div>
                </div>

                {/* Facts / Notes */}
                <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase text-gray-500 tracking-wider">Key Facts</h4>
                    <div className="space-y-2">
                        {facts.map(f => (
                            <div key={f.id} className="text-sm p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-md border border-blue-100 dark:border-blue-800">
                                {f.text}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </ScrollArea>
    );
};

// --- Main Panel ---

export function SeoScorePanel() {
    const { overallScore } = useEditorStore();
    const [activeTab, setActiveTab] = React.useState('guidelines');

    return (
        <div className="h-full flex flex-col bg-white dark:bg-black border-l border-gray-200 dark:border-gray-800 shadow-sm z-10">
            {/* Top Section: Score Gauge */}
            <div className="pt-8 pb-6 border-b border-gray-100 dark:border-gray-800 flex flex-col items-center bg-white dark:bg-black">
                <ScoreGauge score={overallScore} />
                <Button className="mt-4 w-4/5 bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 shadow-none">
                    Auto-Optimize
                </Button>
            </div>

            {/* Tabs Section */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                <div className="px-4 border-b border-gray-100 dark:border-gray-800">
                    <TabsList className="w-full justify-start h-10 bg-transparent p-0 gap-6">
                        <TabsTrigger
                            value="guidelines"
                            className="data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 rounded-none px-0 pb-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors bg-transparent shadow-none"
                        >
                            Guidelines
                        </TabsTrigger>
                        <TabsTrigger
                            value="outline"
                            className="data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 rounded-none px-0 pb-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors bg-transparent shadow-none"
                        >
                            Outline
                        </TabsTrigger>
                        <TabsTrigger
                            value="brief"
                            className="data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 rounded-none px-0 pb-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors bg-transparent shadow-none"
                        >
                            Brief
                        </TabsTrigger>
                    </TabsList>
                </div>

                <div className="flex-1 bg-white dark:bg-black overflow-hidden relative">
                    <TabsContent value="guidelines" className="h-full m-0 absolute inset-0">
                        <GuidelinesTab />
                    </TabsContent>

                    <TabsContent value="outline" className="h-full m-0 absolute inset-0">
                        <OutlineTab />
                    </TabsContent>

                    <TabsContent value="brief" className="h-full m-0 absolute inset-0">
                        <BriefTab />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
