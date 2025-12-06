import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ContentGenerationFormData } from '@/lib/schemas/content-generation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Target, Brain, Link as LinkIcon, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { List, BookOpen, Scale, Star, Zap } from 'lucide-react';

const CONTENT_TYPES = [
    { id: 'How-To Guide', icon: FileText },
    { id: 'Listicle', icon: List },
    { id: 'Ultimate Guide', icon: BookOpen },
    { id: 'Comparison', icon: Scale },
    { id: 'Review', icon: Star },
    { id: 'Tutorial', icon: Zap },
];

interface ContentGenerationFormProps {
    form: UseFormReturn<ContentGenerationFormData>;
    onSubmit: () => void;
    projectId?: string;
}

export function ContentGenerationForm({ form, onSubmit, projectId }: ContentGenerationFormProps) {
    const { register, watch, setValue } = form;
    const wordCount = watch('wordCountTarget');
    const tone = watch('toneAdjustment');

    // Mock Internal Links Data (Ideally passed as prop or fetched via another hook)
    const mockInternalLinks = [
        { postId: '1', title: 'SEO Basics 2024', url: '/blog/seo-basics', relevanceScore: 0.95 },
        { postId: '2', title: 'Keyword Research Guide', url: '/blog/keyword-research', relevanceScore: 0.88 },
        { postId: '3', title: 'On-Page SEO Checklist', url: '/blog/on-page-seo', relevanceScore: 0.75 },
    ];

    return (
        <ScrollArea className="flex-1 px-6 py-6">
            <form id="content-gen-form" onSubmit={onSubmit} className="space-y-8">

                {/* SECTION 1: CONTENT BASICS */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Content Basics
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Target Keyword</Label>
                            <Input {...register('targetKeyword')} placeholder="e.g. programmatic seo" />
                        </div>
                        <div className="space-y-2">
                            <Label>Secondary Keywords (comma separated)</Label>
                            <Input
                                placeholder="e.g. seo automation, python seo"
                                onChange={e => setValue('secondaryKeywords', e.target.value.split(',').map(s => s.trim()))}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Content Type</Label>
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                            {CONTENT_TYPES.map(type => (
                                <div
                                    key={type.id}
                                    onClick={() => setValue('contentType', type.id as any)}
                                    className={`cursor-pointer flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${watch('contentType') === type.id
                                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                                        : 'border-gray-200 dark:border-gray-800 hover:border-purple-300'
                                        }`}
                                >
                                    <type.icon className="w-6 h-6 mb-2" />
                                    <span className="text-xs font-medium text-center">{type.id}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* SECTION 2: PROJECT CONTEXT */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <Target className="w-4 h-4" /> Project Context
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Project</Label>
                            <Select onValueChange={v => setValue('projectId', v)} defaultValue={projectId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Project" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="p1">ApexSEO Marketing</SelectItem>
                                    <SelectItem value="p2">Client A</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Brand Voice</Label>
                            <div className="flex gap-2">
                                <Badge variant="secondary">Professional</Badge>
                                <Badge variant="secondary">Technical</Badge>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SECTION 3: AI CONFIGURATION */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <Brain className="w-4 h-4" /> AI Configuration
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border">
                        <div className="space-y-3">
                            <Label>Research Provider</Label>
                            <div className="flex bg-white dark:bg-gray-800 rounded-lg p-1 border">
                                {['perplexity', 'openai'].map(p => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setValue('researchProvider', p as any)}
                                        className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${watch('researchProvider') === p
                                            ? 'bg-purple-100 text-purple-700 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-900'
                                            }`}
                                    >
                                        {p.charAt(0).toUpperCase() + p.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-3">
                            <Label>Drafting Model</Label>
                            <div className="flex bg-white dark:bg-gray-800 rounded-lg p-1 border">
                                {['openai', 'claude', 'grok'].map(p => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setValue('draftingProvider', p as any)}
                                        className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${watch('draftingProvider') === p
                                            ? 'bg-purple-100 text-purple-700 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-900'
                                            }`}
                                    >
                                        {p.charAt(0).toUpperCase() + p.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-3">
                            <Label>Audience Level</Label>
                            <Select onValueChange={v => setValue('audienceLevel', v as any)} defaultValue="Intermediate">
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Beginner">Beginner</SelectItem>
                                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                                    <SelectItem value="Expert">Expert</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-3">
                            <Label>Perspective</Label>
                            <Select onValueChange={v => setValue('perspective', v as any)} defaultValue="Second Person">
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="First Person">First Person (I/We)</SelectItem>
                                    <SelectItem value="Second Person">Second Person (You)</SelectItem>
                                    <SelectItem value="Third Person">Third Person (They)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* SECTION 4: ADVANCED OPTIONS */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Advanced Options</h3>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Label>Word Count Target</Label>
                                <span className="text-xs text-muted-foreground">Competitors avg: 2,340 words</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <input
                                    type="range"
                                    min={500}
                                    max={5000}
                                    step={100}
                                    value={wordCount}
                                    onChange={e => setValue('wordCountTarget', parseInt(e.target.value))}
                                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                />
                                <span className="w-16 text-right font-mono text-sm">{wordCount}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Label>Tone Adjustment</Label>
                                <span className="text-xs text-muted-foreground">
                                    {tone === 0 ? 'Default' : tone < 0 ? 'More Casual' : 'More Formal'}
                                </span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-xs text-gray-400">Casual</span>
                                <input
                                    type="range"
                                    min={-2}
                                    max={2}
                                    step={1}
                                    value={tone}
                                    onChange={e => setValue('toneAdjustment', parseInt(e.target.value))}
                                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                />
                                <span className="text-xs text-gray-400">Formal</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SECTION 5: INTERNAL LINKING */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <LinkIcon className="w-4 h-4" /> Internal Linking
                    </h3>
                    <div className="border rounded-xl p-4 space-y-3">
                        <Label>Suggested Links (Auto-detected)</Label>
                        <div className="flex flex-wrap gap-2">
                            {mockInternalLinks.map(link => (
                                <div key={link.postId} className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-full text-sm border border-blue-100 dark:border-blue-800">
                                    <span className="truncate max-w-[200px]">{link.title}</span>
                                    <Badge variant="outline" className="text-[10px] h-5 bg-white/50">{Math.round(link.relevanceScore * 100)}%</Badge>
                                    <button type="button" className="hover:text-blue-900"><X className="w-3 h-3" /></button>
                                </div>
                            ))}
                            <Button variant="outline" size="sm" className="rounded-full h-8 border-dashed text-xs">
                                + Add Manual Link
                            </Button>
                        </div>
                    </div>
                </div>

            </form>
        </ScrollArea>
    );
}
