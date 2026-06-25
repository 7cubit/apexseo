'use client';

import React from 'react';
import { useEditorStore } from '@/stores/editorStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, XCircle, ChevronRight, HelpCircle, Info, Sparkles } from 'lucide-react';
import { CircularProgressRing } from './CircularProgressRing';

// --- Sub-Components ---

const OptimizeTab = () => {
    const { keywords } = useEditorStore();

    // Group keywords logically
    const criticalTerms = keywords.filter((_, i) => i < 3);
    const extendedVocab = keywords.filter((_, i) => i >= 3 && i < 6);
    const headingTerms = keywords.filter((_, i) => i >= 6);

    const renderKeywordGroup = (title: string, terms: typeof keywords) => (
        <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">{title}</h4>
            <div className="space-y-1">
                {terms.map((k, i) => {
                    // Determine dot color based on status
                    let dotColor = 'text-muted-foreground/40'; // grey - unused
                    if (k.status === 'optimal') dotColor = 'text-green-500'; // green - used optimally
                    if (k.status === 'overused') dotColor = 'text-red-500'; // red - overused
                    if (k.count === k.target) dotColor = 'text-amber-500'; // gold - perfect

                    return (
                        <div
                            key={i}
                            className="flex items-center justify-between p-2 rounded-md hover:bg-secondary/50 group transition-colors cursor-pointer"
                            title={`${k.count}/${k.target} uses`}
                        >
                            <div className="flex items-center gap-2">
                                <span className={`text-lg ${dotColor} transition-colors`}>●</span>
                                <span className={`text-sm font-medium ${k.status === 'optimal' ? 'text-foreground' : 'text-muted-foreground'}`}>
                                    {k.keyword}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 text-xs gap-1 text-primary"
                                >
                                    <Sparkles className="w-3 h-3" /> Add
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <ScrollArea className="h-full">
            <div className="p-4 space-y-6">
                {renderKeywordGroup('Critical Terms', criticalTerms)}
                {renderKeywordGroup('Extended Vocabulary', extendedVocab)}
                {renderKeywordGroup('Heading Terms', headingTerms)}
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
    const [activeTab, setActiveTab] = React.useState('optimize');

    return (
        <div className="h-full flex flex-col bg-editor-surface border-l border-border/30 shadow-depth-sm z-10">
            {/* Top Section: Compact Score Ring */}
            <div className="pt-6 pb-4 border-b border-border/30 flex flex-col items-center bg-secondary/10">
                <CircularProgressRing score={overallScore} />
                <Button className="mt-4 w-4/5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-depth-sm">
                    Auto-Optimize
                </Button>
            </div>

            {/* Tabs Section */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                <div className="px-4 border-b border-border/30">
                    <TabsList className="w-full justify-start h-10 bg-transparent p-0 gap-6">
                        <TabsTrigger
                            value="optimize"
                            className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-0 pb-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors bg-transparent shadow-none"
                        >
                            Optimize
                        </TabsTrigger>
                        <TabsTrigger
                            value="outline"
                            className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-0 pb-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors bg-transparent shadow-none"
                        >
                            Outline
                        </TabsTrigger>
                        <TabsTrigger
                            value="brief"
                            className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-0 pb-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors bg-transparent shadow-none"
                        >
                            Brief
                        </TabsTrigger>
                    </TabsList>
                </div>

                <div className="flex-1 bg-transparent overflow-hidden relative">
                    <TabsContent value="optimize" className="h-full m-0 absolute inset-0">
                        <OptimizeTab />
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
