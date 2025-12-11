'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowRight, ArrowLeft, Plus, Trash2, Globe, Briefcase, ShoppingCart, Cpu, Heart, BookOpen, Zap, Shield, Smile, BarChart } from 'lucide-react';

// V3 Interfaces (Mirrors Backend)
interface MarketContext {
    id: string;
    name: string;
    locale: { country: string; language: string; };
    competitors: { domain: string; type: 'direct' | 'search' }[];
    seedKeywords: string[];
}

interface ContentArchetype {
    id: string;
    name: string;
    voice: { tone: string; readingLevel: string; perspective: 'First Person (We)' | 'Third Person (It)' };
    targetAudience: string;
}

interface KnowledgeGraph {
    products: { id: string; name: string; description: string; features: string[] }[];
    usps: { id: string; statement: string; evidence: string }[];
    personnel: { id: string; name: string; role: string; bio: string }[];
}

interface BrandVoiceDNA {
    toneProfile: { formal: number; technical: number; serious: number; dataDriven: number; };
    vocabularyFingerprint: string[];
    structuralPreferences: { avgH2Count: number; listUsage: 'low' | 'medium' | 'high'; };
    bannedPhrases: string[];
}

interface ContentPillar {
    id: string;
    topic: string;
    subtopics: string[];
    targetKeywords: string[];
}

export function ProjectWizard() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        identity: {
            name: '',
            colors: { primary: '#000000', secondary: '#ffffff', accent: '#3b82f6' },
            bannedWords: [] as string[],
            boilerplate: ''
        },
        markets: [] as MarketContext[],
        knowledgeGraph: { products: [], usps: [], personnel: [] } as KnowledgeGraph,
        archetypes: [] as ContentArchetype[],
        brandVoiceDNA: undefined as BrandVoiceDNA | undefined,
        contentPillars: [] as ContentPillar[]
    });

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('project-wizard-v3-draft');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setFormData(prev => ({
                    ...prev,
                    ...parsed,
                    identity: {
                        ...prev.identity,
                        ...(parsed.identity || {}),
                        colors: {
                            ...prev.identity.colors,
                            ...(parsed.identity?.colors || {})
                        }
                    },
                    markets: parsed.markets || prev.markets,
                    knowledgeGraph: {
                        ...prev.knowledgeGraph,
                        ...(parsed.knowledgeGraph || {})
                    },
                    archetypes: parsed.archetypes || prev.archetypes
                }));
            } catch (e) {
                console.error("Failed to parse saved draft", e);
            }
        }
    }, []);

    // Save to localStorage on change
    useEffect(() => {
        localStorage.setItem('project-wizard-v3-draft', JSON.stringify(formData));
    }, [formData]);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                localStorage.removeItem('project-wizard-v3-draft'); // Clear draft on success
                router.push('/projects');
            } else {
                console.error("Failed to create project");
            }
        } catch (error) {
            console.error("Error submitting project", error);
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => setStep(s => Math.min(s + 1, 6));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    return (
        <div className="max-w-5xl mx-auto py-10">
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Create New Project</h1>
                    <span className="text-sm text-muted-foreground">Step {step} of 6</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                        className="h-full bg-purple-600 transition-all duration-300"
                        style={{ width: `${(step / 6) * 100}%` }}
                    />
                </div>
            </div>

            <Card className="min-h-[600px] flex flex-col border-gray-200 dark:border-gray-800 shadow-lg">
                <div className="flex-1">
                    {step === 1 && <Step1_Identity data={formData} update={(d: any) => setFormData(prev => ({ ...prev, ...d }))} />}
                    {step === 2 && <Step2_BrandIdentity data={formData} update={(d: any) => setFormData(prev => ({ ...prev, ...d }))} />}
                    {step === 3 && <Step3_Knowledge data={formData} update={(d: any) => setFormData(prev => ({ ...prev, ...d }))} />}
                    {step === 4 && <Step4_ContentPillars data={formData} update={(d: any) => setFormData(prev => ({ ...prev, ...d }))} />}
                    {step === 5 && <Step5_ContentImport data={formData} update={(d: any) => setFormData(prev => ({ ...prev, ...d }))} />}
                    {step === 6 && <Step6_Review data={formData} onSubmit={handleSubmit} loading={loading} />}
                </div>

                <CardFooter className="flex justify-between mt-6 border-t pt-6 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg">
                    <Button variant="outline" onClick={prevStep} disabled={step === 1 || loading}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>

                    {step < 6 ? (
                        <Button onClick={nextStep} className="bg-purple-600 hover:bg-purple-700 text-white">
                            Next
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Create Project
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}

// --- Step 1: Global Identity ---
function Step1_Identity({ data, update }: any) {
    const [bannedInput, setBannedInput] = useState('');

    const categories = [
        { name: 'General', icon: Globe },
        { name: 'SaaS', icon: Cpu },
        { name: 'E-commerce', icon: ShoppingCart },
        { name: 'Finance', icon: BarChart },
        { name: 'Health', icon: Heart },
        { name: 'Travel', icon: PlaneIcon }, // Need to import Plane or similar
        { name: 'Food', icon: PizzaIcon }, // Need to import Pizza or similar
        { name: 'Christianity', icon: BookOpen },
        { name: 'AI', icon: Zap },
        { name: 'Legal', icon: Shield }
    ];

    const addBannedWord = () => {
        if (bannedInput) {
            update({ identity: { ...data.identity, bannedWords: [...data.identity.bannedWords, bannedInput] } });
            setBannedInput('');
        }
    };

    return (
        <>
            <CardHeader>
                <CardTitle>Project Basics</CardTitle>
                <CardDescription>Start by defining the core identity of your project.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid gap-2">
                    <Label>Project Name</Label>
                    <Input value={data.name} onChange={e => update({ name: e.target.value })} placeholder="Internal Project Name" />
                </div>
                <div className="grid gap-2">
                    <Label>Brand Name</Label>
                    <Input value={data.identity.name} onChange={e => update({ identity: { ...data.identity, name: e.target.value } })} placeholder="Public Brand Name" />
                </div>

                <div className="grid gap-2">
                    <Label>Primary Category</Label>
                    <div className="grid grid-cols-5 gap-2">
                        {categories.map((cat) => (
                            <div
                                key={cat.name}
                                className={`flex flex-col items-center justify-center p-3 rounded-lg border cursor-pointer transition-all hover:bg-accent ${data.identity.category === cat.name ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-gray-200 dark:border-gray-800'}`}
                                onClick={() => update({ identity: { ...data.identity, category: cat.name } })}
                            >
                                <cat.icon className={`w-6 h-6 mb-2 ${data.identity.category === cat.name ? 'text-purple-600' : 'text-gray-500'}`} />
                                <span className="text-xs font-medium">{cat.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label>Boilerplate Description</Label>
                    <Textarea
                        value={data.identity.boilerplate}
                        onChange={e => update({ identity: { ...data.identity, boilerplate: e.target.value } })}
                        placeholder="ApexSEO is the leading..."
                    />
                </div>
                <div className="grid gap-2">
                    <Label>Primary Color</Label>
                    <div className="flex gap-2 items-center">
                        <div className="relative w-10 h-10 rounded border overflow-hidden shrink-0">
                            <input
                                type="color"
                                value={data.identity.colors.primary}
                                onChange={e => update({ identity: { ...data.identity, colors: { ...data.identity.colors, primary: e.target.value } } })}
                                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 border-0 cursor-pointer"
                            />
                        </div>
                        <Input
                            value={data.identity.colors.primary}
                            onChange={e => update({ identity: { ...data.identity, colors: { ...data.identity.colors, primary: e.target.value } } })}
                            placeholder="#000000"
                            className="font-mono"
                        />
                    </div>
                </div>
                <div className="grid gap-2">
                    <Label>Banned Words (Never Use)</Label>
                    <div className="flex gap-2">
                        <Input value={bannedInput} onChange={e => setBannedInput(e.target.value)} placeholder="e.g. cheap, guarantee" />
                        <Button onClick={addBannedWord} variant="secondary">Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {data.identity.bannedWords.map((w: string, i: number) => (
                            <Badge key={i} variant="destructive">{w}</Badge>
                        ))}
                    </div>
                </div>
            </CardContent>
        </>
    );
}

// Mock Icons for missing ones
const PlaneIcon = ({ className }: { className?: string }) => <Globe className={className} />;
const PizzaIcon = ({ className }: { className?: string }) => <Smile className={className} />;

// --- Step 2: Brand Identity (Neo4j Integration) ---
function Step2_BrandIdentity({ data, update }: any) {
    const [analyzing, setAnalyzing] = useState(false);
    const [sampleUrl, setSampleUrl] = useState('');
    const [audienceInput, setAudienceInput] = useState('');

    const runVoiceAnalysis = async () => {
        if (!sampleUrl) return;
        setAnalyzing(true);
        // Simulate API call to extractBrandVoiceDNA
        // In real app: await fetch('/api/analyze-voice', { body: { url: sampleUrl } })
        setTimeout(() => {
            const mockDNA: BrandVoiceDNA = {
                toneProfile: { formal: 75, technical: 60, serious: 40, dataDriven: 80 },
                vocabularyFingerprint: ['innovative', 'scalable', 'robust', 'seamless'],
                structuralPreferences: { avgH2Count: 8, listUsage: 'high' },
                bannedPhrases: ['game-changer', 'synergy']
            };
            update({ brandVoiceDNA: mockDNA });
            setAnalyzing(false);
        }, 2000);
    };

    const addAudience = () => {
        if (audienceInput) {
            // Store audience in identity for now, or add a specific field
            // Assuming we use a simple array in identity or just tags
            // For this wizard, let's just use a local state or add to a new field if we had one.
            // We'll skip for now to keep it simple or add to a 'targetAudience' field in identity if we added it.
            setAudienceInput('');
        }
    };

    return (
        <>
            <CardHeader>
                <CardTitle>Brand Identity & Voice</CardTitle>
                <CardDescription>Define how your brand speaks to its audience.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid gap-2">
                    <Label>Brand Voice</Label>
                    <Select
                        value={data.archetypes[0]?.voice?.tone || 'Professional'}
                        onValueChange={(v) => {
                            // Update a default archetype or identity field
                            // For simplicity, we just store it in a temporary way or assume the first archetype
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select a primary voice" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Professional">Professional</SelectItem>
                            <SelectItem value="Casual">Casual</SelectItem>
                            <SelectItem value="Technical">Technical</SelectItem>
                            <SelectItem value="Friendly">Friendly</SelectItem>
                            <SelectItem value="Authoritative">Authoritative</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900/50 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h4 className="font-medium flex items-center gap-2">
                                <Cpu className="w-4 h-4 text-purple-500" />
                                AI Voice DNA Extractor
                            </h4>
                            <p className="text-xs text-muted-foreground">Analyze your existing content to clone your voice.</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Input
                            placeholder="https://yourwebsite.com/blog/sample-post"
                            value={sampleUrl}
                            onChange={e => setSampleUrl(e.target.value)}
                        />
                        <Button onClick={runVoiceAnalysis} disabled={analyzing || !sampleUrl} variant="secondary">
                            {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                            Analyze
                        </Button>
                    </div>

                    {data.brandVoiceDNA && (
                        <div className="space-y-3 pt-2 animate-in fade-in slide-in-from-top-2">
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="bg-white dark:bg-gray-800 p-2 rounded border">
                                    <span className="text-muted-foreground">Formal</span>
                                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${data.brandVoiceDNA.toneProfile.formal}%` }} />
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-gray-800 p-2 rounded border">
                                    <span className="text-muted-foreground">Technical</span>
                                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                        <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${data.brandVoiceDNA.toneProfile.technical}%` }} />
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {data.brandVoiceDNA.vocabularyFingerprint.map((word: string, i: number) => (
                                    <Badge key={i} variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">{word}</Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid gap-2">
                    <Label>Target Audience Tags</Label>
                    <div className="flex gap-2">
                        <Input
                            placeholder="e.g. CTOs, Marketing Managers"
                            value={audienceInput}
                            onChange={e => setAudienceInput(e.target.value)}
                        />
                        <Button onClick={addAudience} variant="outline"><Plus className="w-4 h-4" /></Button>
                    </div>
                </div>
            </CardContent>
        </>
    );
}

// --- Step 3: Knowledge Graph ---
function Step3_Knowledge({ data, update }: any) {
    // Simplified for brevity - just Products
    const addProduct = () => {
        const newProduct = { id: crypto.randomUUID(), name: '', description: '', features: [] };
        update({ knowledgeGraph: { ...data.knowledgeGraph, products: [...data.knowledgeGraph.products, newProduct] } });
    };

    return (
        <>
            <CardHeader>
                <CardTitle>Knowledge Graph</CardTitle>
                <CardDescription>Define structured entities to ground AI generation.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Products / Services</h3>
                        <Button size="sm" onClick={addProduct}><Plus className="w-4 h-4" /></Button>
                    </div>
                    {data.knowledgeGraph.products.map((prod: any, i: number) => (
                        <div key={prod.id} className="border p-4 rounded-lg space-y-2">
                            <Input
                                placeholder="Product Name"
                                value={prod.name}
                                onChange={e => {
                                    const newProds = [...data.knowledgeGraph.products];
                                    newProds[i].name = e.target.value;
                                    update({ knowledgeGraph: { ...data.knowledgeGraph, products: newProds } });
                                }}
                            />
                            <Textarea
                                placeholder="Description"
                                value={prod.description}
                                onChange={e => {
                                    const newProds = [...data.knowledgeGraph.products];
                                    newProds[i].description = e.target.value;
                                    update({ knowledgeGraph: { ...data.knowledgeGraph, products: newProds } });
                                }}
                            />
                        </div>
                    ))}
                </div>
            </CardContent>
        </>
    );
}

// --- Step 4: Content Pillars (Topic Clusters) ---
function Step4_ContentPillars({ data, update }: any) {
    const addPillar = () => {
        const newPillar: ContentPillar = {
            id: crypto.randomUUID(),
            topic: 'New Topic Cluster',
            subtopics: [],
            targetKeywords: []
        };
        update({ contentPillars: [...data.contentPillars, newPillar] });
    };

    const updatePillar = (index: number, field: keyof ContentPillar, value: any) => {
        const newPillars = [...data.contentPillars];
        newPillars[index] = { ...newPillars[index], [field]: value };
        update({ contentPillars: newPillars });
    };

    return (
        <>
            <CardHeader>
                <CardTitle>Content Pillars</CardTitle>
                <CardDescription>Define the main topic clusters for your topical authority.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.contentPillars.map((pillar: ContentPillar, i: number) => (
                        <div key={pillar.id} className="border p-4 rounded-lg space-y-3 bg-white dark:bg-gray-900 shadow-sm relative group">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => update({ contentPillars: data.contentPillars.filter((_: any, idx: number) => idx !== i) })}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>

                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                                    <Globe className="w-4 h-4 text-purple-600" />
                                </div>
                                <Input
                                    value={pillar.topic}
                                    onChange={e => updatePillar(i, 'topic', e.target.value)}
                                    className="font-semibold border-none shadow-none p-0 h-auto focus-visible:ring-0"
                                />
                            </div>

                            <div className="space-y-2 pl-2 border-l-2 border-gray-100 dark:border-gray-800 ml-4">
                                <Label className="text-xs text-muted-foreground">Subtopics (Comma separated)</Label>
                                <Textarea
                                    value={pillar.subtopics.join(', ')}
                                    onChange={e => updatePillar(i, 'subtopics', e.target.value.split(',').map(s => s.trim()))}
                                    className="text-sm min-h-[60px]"
                                    placeholder="e.g. Guides, Tutorials, Case Studies"
                                />
                            </div>
                        </div>
                    ))}

                    <Button onClick={addPillar} variant="outline" className="h-full min-h-[200px] border-dashed flex flex-col gap-2 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
                            <Plus className="w-6 h-6 text-gray-500" />
                        </div>
                        <span className="text-muted-foreground">Add Topic Cluster</span>
                    </Button>
                </div>
            </CardContent>
        </>
    );
}

// --- Step 5: Existing Content Import ---
function Step5_ContentImport({ data, update }: any) {
    const [sitemapUrl, setSitemapUrl] = useState('');
    const [importing, setImporting] = useState(false);
    const [importedCount, setImportedCount] = useState(0);

    const handleImport = () => {
        if (!sitemapUrl) return;
        setImporting(true);
        // Simulate import
        setTimeout(() => {
            setImportedCount(142);
            setImporting(false);
        }, 1500);
    };

    return (
        <>
            <CardHeader>
                <CardTitle>Import Existing Content</CardTitle>
                <CardDescription>Connect your existing content to build the Knowledge Graph.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid gap-4">
                    <div className="border rounded-lg p-6 flex flex-col items-center justify-center text-center space-y-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors cursor-pointer border-dashed">
                        <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                            <BarChart className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Connect Google Search Console</h3>
                            <p className="text-sm text-muted-foreground">Auto-sync your sitemaps and performance data.</p>
                        </div>
                        <Button variant="outline">Connect GSC</Button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Or manually</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Sitemap URL</Label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="https://example.com/sitemap.xml"
                                value={sitemapUrl}
                                onChange={e => setSitemapUrl(e.target.value)}
                            />
                            <Button onClick={handleImport} disabled={importing || !sitemapUrl}>
                                {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Import'}
                            </Button>
                        </div>
                        {importedCount > 0 && (
                            <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-md text-sm flex items-center gap-2 animate-in fade-in">
                                <Shield className="w-4 h-4" />
                                Successfully identified {importedCount} existing pages.
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </>
    );
}

// --- Step 6: Review & Knowledge Graph ---
function Step6_Review({ data, onSubmit, loading }: any) {
    return (
        <>
            <CardHeader>
                <CardTitle>Review & Initialize</CardTitle>
                <CardDescription>Review your project structure and generate the Knowledge Graph.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="bg-muted p-6 rounded-lg space-y-4">
                    <div className="flex items-center justify-between border-b pb-4">
                        <div>
                            <h3 className="font-bold text-lg">{data.name}</h3>
                            <p className="text-sm text-muted-foreground">{data.identity.category || 'General'} Project</p>
                        </div>
                        <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50">Ready to Build</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                            <span className="font-medium text-muted-foreground">Brand Voice</span>
                            <div className="flex items-center gap-2">
                                <Cpu className="w-4 h-4" />
                                <span>{data.brandVoiceDNA ? 'AI-Analyzed DNA' : 'Manual Setup'}</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <span className="font-medium text-muted-foreground">Content Pillars</span>
                            <div className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4" />
                                <span>{data.contentPillars.length} Clusters Defined</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <span className="font-medium text-muted-foreground">Products</span>
                            <div className="flex items-center gap-2">
                                <ShoppingCart className="w-4 h-4" />
                                <span>{data.knowledgeGraph.products.length} Products</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <span className="font-medium text-muted-foreground">Imported Content</span>
                            <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4" />
                                <span>142 Pages (Mock)</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border rounded-lg p-4 bg-white dark:bg-gray-950 overflow-hidden">
                    <h4 className="font-medium mb-4 text-sm flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        Knowledge Graph Preview
                    </h4>
                    <div className="flex flex-col items-center space-y-4">
                        {/* Root Node */}
                        <div className="flex flex-col items-center">
                            <div className="px-4 py-2 bg-purple-600 text-white rounded-full text-sm font-bold shadow-lg z-10">
                                {data.name || 'Project'}
                            </div>
                            <div className="h-6 w-0.5 bg-gray-300 dark:bg-gray-700"></div>
                        </div>

                        {/* Level 1: Pillars & Products */}
                        <div className="flex gap-8 relative">
                            {/* Connecting Line */}
                            <div className="absolute top-0 left-10 right-10 h-0.5 bg-gray-300 dark:bg-gray-700 -translate-y-6"></div>

                            {/* Pillars Branch */}
                            <div className="flex flex-col items-center">
                                <div className="h-6 w-0.5 bg-gray-300 dark:bg-gray-700 -mt-6"></div>
                                <div className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-medium border border-blue-200 dark:border-blue-800 mb-2">
                                    Content Pillars ({data.contentPillars.length})
                                </div>
                                <div className="flex gap-2">
                                    {data.contentPillars.slice(0, 3).map((p: any, i: number) => (
                                        <div key={i} className="w-2 h-2 rounded-full bg-blue-400" title={p.topic}></div>
                                    ))}
                                    {data.contentPillars.length > 3 && <div className="text-[10px] text-gray-400">...</div>}
                                </div>
                            </div>

                            {/* Products Branch */}
                            <div className="flex flex-col items-center">
                                <div className="h-6 w-0.5 bg-gray-300 dark:bg-gray-700 -mt-6"></div>
                                <div className="px-3 py-1.5 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded-lg text-xs font-medium border border-green-200 dark:border-green-800 mb-2">
                                    Products ({data.knowledgeGraph.products.length})
                                </div>
                                <div className="flex gap-2">
                                    {data.knowledgeGraph.products.slice(0, 3).map((p: any, i: number) => (
                                        <div key={i} className="w-2 h-2 rounded-full bg-green-400" title={p.name}></div>
                                    ))}
                                </div>
                            </div>

                            {/* Identity Branch */}
                            <div className="flex flex-col items-center">
                                <div className="h-6 w-0.5 bg-gray-300 dark:bg-gray-700 -mt-6"></div>
                                <div className="px-3 py-1.5 bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 rounded-lg text-xs font-medium border border-orange-200 dark:border-orange-800 mb-2">
                                    Identity
                                </div>
                                <div className="text-[10px] text-gray-500">
                                    {data.brandVoiceDNA ? 'DNA Extracted' : 'Standard'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </>
    );
}
