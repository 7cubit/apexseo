'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowRight, ArrowLeft, Plus, Trash2 } from 'lucide-react';

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
        archetypes: [] as ContentArchetype[]
    });

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
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

    const nextStep = () => setStep(s => Math.min(s + 1, 5));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    return (
        <div className="max-w-4xl mx-auto py-10">
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Create New Project (V3)</h1>
                    <span className="text-sm text-muted-foreground">Step {step} of 5</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${(step / 5) * 100}%` }}
                    />
                </div>
            </div>

            <Card className="min-h-[500px] flex flex-col">
                <div className="flex-1">
                    {step === 1 && <Step1_Identity data={formData} update={d => setFormData({ ...formData, ...d })} />}
                    {step === 2 && <Step2_Markets data={formData} update={d => setFormData({ ...formData, ...d })} />}
                    {step === 3 && <Step3_Knowledge data={formData} update={d => setFormData({ ...formData, ...d })} />}
                    {step === 4 && <Step4_Archetypes data={formData} update={d => setFormData({ ...formData, ...d })} />}
                    {step === 5 && <Step5_Review data={formData} onSubmit={handleSubmit} loading={loading} />}
                </div>

                <CardFooter className="flex justify-between mt-6 border-t pt-6">
                    <Button variant="outline" onClick={prevStep} disabled={step === 1 || loading}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>

                    {step < 5 ? (
                        <Button onClick={nextStep}>
                            Next
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit} disabled={loading}>
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

    const addBannedWord = () => {
        if (bannedInput) {
            update({ identity: { ...data.identity, bannedWords: [...data.identity.bannedWords, bannedInput] } });
            setBannedInput('');
        }
    };

    return (
        <>
            <CardHeader>
                <CardTitle>Global Brand Identity</CardTitle>
                <CardDescription>Define the core identity that applies across all markets and content.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-2">
                    <Label>Project Name</Label>
                    <Input value={data.name} onChange={e => update({ name: e.target.value })} placeholder="Internal Project Name" />
                </div>
                <div className="grid gap-2">
                    <Label>Brand Name</Label>
                    <Input value={data.identity.name} onChange={e => update({ identity: { ...data.identity, name: e.target.value } })} placeholder="Public Brand Name" />
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
                    <div className="flex gap-2">
                        <div className="w-10 h-10 rounded border" style={{ backgroundColor: data.identity.colors.primary }}></div>
                        <Input value={data.identity.colors.primary} onChange={e => update({ identity: { ...data.identity, colors: { ...data.identity.colors, primary: e.target.value } } })} />
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

// --- Step 2: Market Contexts ---
function Step2_Markets({ data, update }: any) {
    const addMarket = () => {
        const newMarket: MarketContext = {
            id: crypto.randomUUID(),
            name: 'New Market',
            locale: { country: 'US', language: 'en' },
            competitors: [],
            seedKeywords: []
        };
        update({ markets: [...data.markets, newMarket] });
    };

    const updateMarket = (index: number, field: string, value: any) => {
        const newMarkets = [...data.markets];
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            newMarkets[index] = { ...newMarkets[index], [parent]: { ...newMarkets[index][parent as keyof MarketContext] as any, [child]: value } };
        } else {
            newMarkets[index] = { ...newMarkets[index], [field]: value };
        }
        update({ markets: newMarkets });
    };

    return (
        <>
            <CardHeader>
                <CardTitle>Market Contexts</CardTitle>
                <CardDescription>Define distinct markets (e.g. US, DE) with their own competitors.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {data.markets.map((market: MarketContext, index: number) => (
                    <div key={market.id} className="border p-4 rounded-lg space-y-4 relative">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 text-destructive"
                            onClick={() => update({ markets: data.markets.filter((_: any, i: number) => i !== index) })}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Market Name</Label>
                                <Input value={market.name} onChange={e => updateMarket(index, 'name', e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="grid gap-2">
                                    <Label>Country</Label>
                                    <Input value={market.locale.country} onChange={e => updateMarket(index, 'locale.country', e.target.value)} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Language</Label>
                                    <Input value={market.locale.language} onChange={e => updateMarket(index, 'locale.language', e.target.value)} />
                                </div>
                            </div>
                        </div>
                        {/* Simplified Competitor Input for MVP */}
                        <div className="grid gap-2">
                            <Label>Competitors (Comma separated)</Label>
                            <Input
                                placeholder="comp1.com, comp2.com"
                                onBlur={e => {
                                    const domains = e.target.value.split(',').map(d => d.trim()).filter(Boolean);
                                    updateMarket(index, 'competitors', domains.map(d => ({ domain: d, type: 'search' })));
                                }}
                            />
                        </div>
                    </div>
                ))}
                <Button onClick={addMarket} variant="outline" className="w-full border-dashed">
                    <Plus className="w-4 h-4 mr-2" /> Add Market Context
                </Button>
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

// --- Step 4: Content Archetypes ---
function Step4_Archetypes({ data, update }: any) {
    const addArchetype = () => {
        const newArch: ContentArchetype = {
            id: crypto.randomUUID(),
            name: 'New Archetype',
            voice: { tone: 'Helpful', readingLevel: 'High School', perspective: 'First Person (We)' },
            targetAudience: ''
        };
        update({ archetypes: [...data.archetypes, newArch] });
    };

    return (
        <>
            <CardHeader>
                <CardTitle>Content Archetypes</CardTitle>
                <CardDescription>Define specific voices for different content types.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {data.archetypes.map((arch: ContentArchetype, i: number) => (
                    <div key={arch.id} className="border p-4 rounded-lg space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Archetype Name</Label>
                                <Input
                                    value={arch.name}
                                    onChange={e => {
                                        const newArchs = [...data.archetypes];
                                        newArchs[i].name = e.target.value;
                                        update({ archetypes: newArchs });
                                    }}
                                    placeholder="e.g. Educational Blog"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Tone</Label>
                                <Input
                                    value={arch.voice.tone}
                                    onChange={e => {
                                        const newArchs = [...data.archetypes];
                                        newArchs[i].voice.tone = e.target.value;
                                        update({ archetypes: newArchs });
                                    }}
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>Target Audience</Label>
                            <Textarea
                                value={arch.targetAudience}
                                onChange={e => {
                                    const newArchs = [...data.archetypes];
                                    newArchs[i].targetAudience = e.target.value;
                                    update({ archetypes: newArchs });
                                }}
                                placeholder="Who is this content for?"
                            />
                        </div>
                    </div>
                ))}
                <Button onClick={addArchetype} variant="outline" className="w-full border-dashed">
                    <Plus className="w-4 h-4 mr-2" /> Add Archetype
                </Button>
            </CardContent>
        </>
    );
}

// --- Step 5: Review ---
function Step5_Review({ data, onSubmit, loading }: any) {
    return (
        <>
            <CardHeader>
                <CardTitle>Review & Create</CardTitle>
                <CardDescription>Review your V3 Project setup.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                    <div className="flex justify-between"><span className="font-medium">Project:</span> <span>{data.name}</span></div>
                    <div className="flex justify-between"><span className="font-medium">Markets:</span> <span>{data.markets.length}</span></div>
                    <div className="flex justify-between"><span className="font-medium">Products:</span> <span>{data.knowledgeGraph.products.length}</span></div>
                    <div className="flex justify-between"><span className="font-medium">Archetypes:</span> <span>{data.archetypes.length}</span></div>
                </div>
            </CardContent>
        </>
    );
}
