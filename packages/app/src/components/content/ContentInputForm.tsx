import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Loader2, Briefcase } from 'lucide-react';
import { EEATRequest } from '@/lib/eeat-service';

interface ContentInputFormProps {
    onSubmit: (data: EEATRequest) => void;
    isLoading: boolean;
}

interface ProjectSummary {
    id: string;
    name: string;
}

export const ContentInputForm: React.FC<ContentInputFormProps> = ({ onSubmit, isLoading }) => {
    const [topic, setTopic] = useState('');
    const [keywords, setKeywords] = useState('');
    const [brandVoice, setBrandVoice] = useState('Professional');
    const [projects, setProjects] = useState<ProjectSummary[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');

    useEffect(() => {
        // Fetch projects for dropdown
        fetch('/api/projects')
            .then(res => res.json())
            .then(data => setProjects(data))
            .catch(err => console.error("Failed to fetch projects", err));
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            topic,
            keywords: (keywords || '').split(',').map(k => k.trim()).filter(k => k),
            brandVoice,
            providers: { research: 'perplexity', drafting: 'openai' },
            projectId: selectedProjectId || undefined,
            category: 'General',
            audienceLevel: 'Beginner'
        });
    };

    return (
        <Card className="w-full h-fit border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0F1219]">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                    Content Studio
                </CardTitle>
                <CardDescription>
                    Generate E-E-A-T optimized content using the Power Algorithm.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Project Context (Optional)</Label>
                        <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                            <SelectTrigger className="bg-gray-50 dark:bg-gray-900">
                                <SelectValue placeholder="Select a project to use its Knowledge Graph..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">No Project (Generic)</SelectItem>
                                {projects.map(p => (
                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            Selecting a project will inject its Brand Identity, Products, and USPs into the AI.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="topic">Topic / Title</Label>
                        <Input
                            id="topic"
                            placeholder="e.g., The Future of SEO in 2025"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            required
                            className="bg-gray-50 dark:bg-gray-900"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="keywords">Target Keywords (comma separated)</Label>
                        <Input
                            id="keywords"
                            placeholder="e.g., AI SEO, Voice Search, Google SGE"
                            value={keywords}
                            onChange={(e) => setKeywords(e.target.value)}
                            className="bg-gray-50 dark:bg-gray-900"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="voice">Brand Voice</Label>
                        <Select value={brandVoice} onValueChange={setBrandVoice}>
                            <SelectTrigger className="bg-gray-50 dark:bg-gray-900">
                                <SelectValue placeholder="Select voice" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Professional">Professional</SelectItem>
                                <SelectItem value="Authoritative">Authoritative</SelectItem>
                                <SelectItem value="Conversational">Conversational</SelectItem>
                                <SelectItem value="Technical">Technical</SelectItem>
                                <SelectItem value="Witty">Witty</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                        disabled={isLoading || !topic}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Generate Content
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};
