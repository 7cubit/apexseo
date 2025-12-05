import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShieldCheck, BookOpen, Link as LinkIcon, AlertTriangle, CheckCircle2, FileText, Layout, Search } from 'lucide-react';
import { EEATResponse } from '@/lib/eeat-service';

interface ContentResultsProps {
    result: EEATResponse;
}

export const ContentResults: React.FC<ContentResultsProps> = ({ result }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Main Content Area */}
            <Card className="lg:col-span-2 h-full flex flex-col border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0F1219]">
                <Tabs defaultValue="draft" className="flex flex-col h-full">
                    <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-0">
                        <div className="flex items-center justify-between mb-4">
                            <CardTitle>Content Studio</CardTitle>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                E-E-A-T Optimized
                            </Badge>
                        </div>
                        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                            <TabsTrigger value="draft" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none px-4 py-2">
                                <FileText className="w-4 h-4 mr-2" /> Draft
                            </TabsTrigger>
                            <TabsTrigger value="blueprint" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none px-4 py-2">
                                <Layout className="w-4 h-4 mr-2" /> Blueprint
                            </TabsTrigger>
                            <TabsTrigger value="research" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none px-4 py-2">
                                <Search className="w-4 h-4 mr-2" /> Research
                            </TabsTrigger>
                            <TabsTrigger value="seo" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none px-4 py-2">
                                <ShieldCheck className="w-4 h-4 mr-2" /> SEO & Meta
                            </TabsTrigger>
                        </TabsList>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 min-h-[500px]">
                        <TabsContent value="draft" className="h-full m-0">
                            <ScrollArea className="h-full p-6">
                                <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap font-serif text-lg leading-relaxed">
                                    {result.content}
                                </div>
                            </ScrollArea>
                        </TabsContent>

                        <TabsContent value="blueprint" className="h-full m-0">
                            <ScrollArea className="h-full p-6">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Content Architecture Blueprint</h3>
                                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg font-mono text-sm overflow-auto">
                                        <pre>{JSON.stringify(result.architecture, null, 2)}</pre>
                                    </div>
                                </div>
                            </ScrollArea>
                        </TabsContent>

                        <TabsContent value="research" className="h-full m-0">
                            <ScrollArea className="h-full p-6">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Research Intelligence Brief</h3>
                                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg font-mono text-sm overflow-auto">
                                        <pre>{JSON.stringify(result.researchBrief, null, 2)}</pre>
                                    </div>
                                </div>
                            </ScrollArea>
                        </TabsContent>

                        <TabsContent value="seo" className="h-full m-0">
                            <ScrollArea className="h-full p-6">
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">SEO Metadata</h3>
                                        <div className="space-y-3">
                                            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                                <span className="text-xs font-bold text-gray-500 uppercase">Title Tag</span>
                                                <p className="font-medium text-blue-600 dark:text-blue-400">{result.meta?.title || 'N/A'}</p>
                                            </div>
                                            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                                <span className="text-xs font-bold text-gray-500 uppercase">Meta Description</span>
                                                <p className="text-sm text-gray-700 dark:text-gray-300">{result.meta?.description || 'N/A'}</p>
                                            </div>
                                            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                                <span className="text-xs font-bold text-gray-500 uppercase">URL Slug</span>
                                                <p className="font-mono text-sm text-green-600 dark:text-green-400">/{result.meta?.slug || 'url-slug'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">E-E-A-T Compliance Checklist</h3>
                                        <div className="grid grid-cols-1 gap-2">
                                            {result.checklist && Object.entries(result.checklist).map(([key, value]) => (
                                                <div key={key} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded border border-gray-100 dark:border-gray-800">
                                                    {value ? (
                                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                    ) : (
                                                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                                    )}
                                                    <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </ScrollArea>
                        </TabsContent>
                    </CardContent>
                </Tabs>
            </Card>

            {/* Sidebar: Metrics & Audit */}
            <div className="space-y-6">
                {/* Scorecard */}
                <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0F1219]">
                    <CardHeader>
                        <CardTitle className="text-lg">E-E-A-T ScoreCard</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                    <ShieldCheck className="h-4 w-4" /> Trust Score
                                </span>
                                <span className="font-bold">{result.metrics.trustScore}/100</span>
                            </div>
                            <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-green-500 rounded-full transition-all duration-500"
                                    style={{ width: `${result.metrics.trustScore}%` }}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                    <BookOpen className="h-4 w-4" /> Semantic Depth
                                </span>
                                <span className="font-bold">{result.metrics.semanticDepth}/100</span>
                            </div>
                            <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                    style={{ width: `${result.metrics.semanticDepth}%` }}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                <LinkIcon className="h-4 w-4" /> Citations
                            </span>
                            <span className="font-mono font-bold">{result.metrics.citationCount}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Audit Log */}
                <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0F1219]">
                    <CardHeader>
                        <CardTitle className="text-lg">Power Algorithm Log</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[200px] pr-4">
                            <div className="space-y-3">
                                {result.auditLog.map((log, i) => (
                                    <div key={i} className="flex gap-3 text-sm">
                                        <CheckCircle2 className="h-4 w-4 text-purple-500 shrink-0 mt-0.5" />
                                        <span className="text-gray-600 dark:text-gray-300">{log}</span>
                                    </div>
                                ))}
                                {result.auditLog.length === 0 && (
                                    <div className="text-sm text-gray-400 italic">No specific actions logged.</div>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
