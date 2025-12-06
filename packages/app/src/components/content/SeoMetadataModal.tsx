'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { seoMetadataSchema, SeoMetadataFormData } from '@/lib/schemas/seo-metadata';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox'; // Assuming standard checkbox
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch'; // Assuming standard switch
import { Wand2, Globe, Share2, Code, Settings, Check, AlertCircle, RefreshCw, Image as ImageIcon, ExternalLink, Smartphone, Monitor } from 'lucide-react';
import { toast } from 'sonner';

// --- Helper Components ---

const SerpPreview = ({ title, description, slug, isMobile }: { title: string, description: string, slug: string, isMobile: boolean }) => {
    return (
        <div className={`font-sans ${isMobile ? 'max-w-[360px]' : 'max-w-[600px]'} p-4 bg-white rounded-lg border border-gray-100 shadow-sm`}>
            <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">A</div>
                <div className="flex flex-col">
                    <span className="text-xs text-gray-800">ApexSEO</span>
                    <span className="text-xs text-gray-500 truncate max-w-[200px]">https://apexseo.com/{slug}</span>
                </div>
                <div className="ml-auto text-gray-400"><ExternalLink className="w-3 h-3" /></div>
            </div>
            <h3 className="text-xl text-[#1a0dab] hover:underline cursor-pointer truncate leading-tight mb-1">{title || 'Your Page Title'}</h3>
            <p className="text-sm text-[#4d5156] line-clamp-2">{description || 'Your meta description will appear here...'}</p>
        </div>
    );
};

const SocialPreview = ({ title, description, image }: { title: string, description: string, image?: string }) => {
    return (
        <div className="max-w-[500px] border rounded-lg overflow-hidden bg-gray-50">
            <div className="h-[260px] bg-gray-200 flex items-center justify-center relative overflow-hidden">
                {image ? (
                    <img src={image} alt="OG Preview" className="w-full h-full object-cover" />
                ) : (
                    <div className="text-gray-400 flex flex-col items-center">
                        <ImageIcon className="w-12 h-12 mb-2" />
                        <span className="text-sm">1200 x 630px</span>
                    </div>
                )}
            </div>
            <div className="p-3 bg-[#f0f2f5] border-t">
                <div className="text-xs text-gray-500 uppercase mb-1">apexseo.com</div>
                <div className="font-bold text-gray-900 leading-tight mb-1">{title}</div>
                <div className="text-sm text-gray-600 line-clamp-1">{description}</div>
            </div>
        </div>
    );
};

// --- Main Component ---

interface SeoMetadataModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: Partial<SeoMetadataFormData>;
}

export function SeoMetadataModal({ isOpen, onClose, initialData }: SeoMetadataModalProps) {
    const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
    const [generating, setGenerating] = useState(false);

    const form = useForm<SeoMetadataFormData>({
        resolver: zodResolver(seoMetadataSchema),
        defaultValues: {
            title: '',
            description: '',
            slug: '',
            ogTitle: '',
            ogDescription: '',
            schemaType: 'Article',
            robotsIndex: true,
            robotsFollow: true,
            robotsNoArchive: false,
            enableBreadcrumbs: true,
            ...initialData
        }
    });

    const { watch, setValue, register, formState: { errors } } = form;
    const values = watch();

    // Sync OG fields if empty
    useEffect(() => {
        if (!values.ogTitle) setValue('ogTitle', values.title);
        if (!values.ogDescription) setValue('ogDescription', values.description);
    }, [values.title, values.description, setValue, values.ogTitle, values.ogDescription]);

    const handleAiGenerate = (field: 'title' | 'description') => {
        setGenerating(true);
        toast.info(`Generating ${field} variations...`);

        // Mock AI delay
        setTimeout(() => {
            setGenerating(false);
            if (field === 'title') {
                setValue('title', "Ultimate Guide to WordPress Security (2024 Updated)");
                toast.success("Generated optimized title!");
            } else {
                setValue('description', "Learn how to secure your WordPress site against malware and hackers. Proven strategies for 2024 inside. Read the full guide now.");
                toast.success("Generated optimized description!");
            }
        }, 1500);
    };

    const handleSave = (data: SeoMetadataFormData) => {
        console.log("Saving SEO Metadata:", data);
        toast.success("SEO Metadata Saved Successfully!");
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[800px] h-[90vh] flex flex-col p-0 bg-white dark:bg-gray-950">
                <DialogHeader className="px-6 py-4 border-b">
                    <DialogTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5 text-purple-600" />
                        SEO Metadata Editor
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex flex-col">
                    <Tabs defaultValue="general" className="flex-1 flex flex-col">
                        <div className="px-6 border-b bg-gray-50/50 dark:bg-gray-900/50">
                            <TabsList className="bg-transparent h-12 w-full justify-start gap-6 p-0">
                                <TabsTrigger value="general" className="data-[state=active]:border-b-2 border-purple-600 rounded-none px-0 h-full">General</TabsTrigger>
                                <TabsTrigger value="social" className="data-[state=active]:border-b-2 border-purple-600 rounded-none px-0 h-full">Social Sharing</TabsTrigger>
                                <TabsTrigger value="schema" className="data-[state=active]:border-b-2 border-purple-600 rounded-none px-0 h-full">Schema Markup</TabsTrigger>
                                <TabsTrigger value="advanced" className="data-[state=active]:border-b-2 border-purple-600 rounded-none px-0 h-full">Advanced</TabsTrigger>
                            </TabsList>
                        </div>

                        <ScrollArea className="flex-1">
                            <form id="seo-form" onSubmit={form.handleSubmit(handleSave)} className="p-6 space-y-8">

                                <TabsContent value="general" className="space-y-8 m-0">
                                    {/* Section 1: Title Tag */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <Label className="text-base font-semibold">Title Tag</Label>
                                            <span className={`text-xs ${values.title?.length > 60 ? 'text-red-500' : 'text-gray-500'}`}>
                                                {values.title?.length || 0} / 60
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Input {...register('title')} placeholder="Enter page title..." />
                                            <Button type="button" variant="outline" onClick={() => handleAiGenerate('title')} disabled={generating}>
                                                <Wand2 className="w-4 h-4 mr-2" /> AI
                                            </Button>
                                        </div>
                                        {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
                                    </div>

                                    {/* Section 2: Meta Description */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <Label className="text-base font-semibold">Meta Description</Label>
                                            <span className={`text-xs ${values.description?.length > 160 ? 'text-red-500' : 'text-gray-500'}`}>
                                                {values.description?.length || 0} / 160
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Textarea {...register('description')} placeholder="Enter meta description..." className="h-24" />
                                            <Button type="button" variant="outline" className="h-24" onClick={() => handleAiGenerate('description')} disabled={generating}>
                                                <Wand2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Section 3: URL Slug */}
                                    <div className="space-y-4">
                                        <Label className="text-base font-semibold">URL Slug</Label>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-l-md border border-r-0">apexseo.com/</span>
                                            <Input {...register('slug')} className="rounded-l-none" placeholder="your-url-slug" />
                                            {values.slug && !errors.slug && <Check className="w-5 h-5 text-green-500" />}
                                        </div>
                                        {errors.slug && <p className="text-xs text-red-500">{errors.slug.message}</p>}
                                    </div>

                                    {/* Preview Area */}
                                    <div className="bg-gray-50 p-4 rounded-xl border">
                                        <div className="flex justify-between items-center mb-4">
                                            <Label className="text-sm font-medium text-gray-500 uppercase">Google Search Preview</Label>
                                            <div className="flex bg-white rounded-lg border p-1">
                                                <button type="button" onClick={() => setPreviewMode('desktop')} className={`p-1.5 rounded ${previewMode === 'desktop' ? 'bg-gray-100' : ''}`}><Monitor className="w-4 h-4" /></button>
                                                <button type="button" onClick={() => setPreviewMode('mobile')} className={`p-1.5 rounded ${previewMode === 'mobile' ? 'bg-gray-100' : ''}`}><Smartphone className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                        <div className="flex justify-center">
                                            <SerpPreview title={values.title} description={values.description} slug={values.slug} isMobile={previewMode === 'mobile'} />
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="social" className="space-y-8 m-0">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <Label>Social Image (OG:Image)</Label>
                                                <div className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 cursor-pointer transition-colors">
                                                    <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                                                    <span className="text-sm text-gray-600">Drag & drop or click to upload</span>
                                                    <span className="text-xs text-gray-400 mt-1">Rec: 1200 x 630px</span>
                                                </div>
                                                <Button variant="outline" size="sm" className="w-full">
                                                    <Wand2 className="w-3 h-3 mr-2" /> Auto-Generate Image
                                                </Button>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Social Title</Label>
                                                <Input {...register('ogTitle')} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Social Description</Label>
                                                <Textarea {...register('ogDescription')} />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <Label className="text-sm font-medium text-gray-500 uppercase">Facebook / LinkedIn Preview</Label>
                                            <SocialPreview title={values.ogTitle || values.title} description={values.ogDescription || values.description} />
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="schema" className="space-y-6 m-0">
                                    <div className="space-y-4">
                                        <Label>Schema Type</Label>
                                        <Select onValueChange={v => setValue('schemaType', v as any)} defaultValue={values.schemaType}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Article">Article</SelectItem>
                                                <SelectItem value="BlogPosting">BlogPosting</SelectItem>
                                                <SelectItem value="HowTo">HowTo</SelectItem>
                                                <SelectItem value="Recipe">Recipe</SelectItem>
                                                <SelectItem value="Review">Review</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <Label>JSON-LD Preview</Label>
                                            <div className="flex gap-2">
                                                <Button type="button" variant="outline" size="sm"><Check className="w-3 h-3 mr-2" /> Validate</Button>
                                                <Button type="button" variant="outline" size="sm"><RefreshCw className="w-3 h-3 mr-2" /> Regenerate</Button>
                                            </div>
                                        </div>
                                        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-xs overflow-x-auto">
                                            <pre>{JSON.stringify({
                                                "@context": "https://schema.org",
                                                "@type": values.schemaType,
                                                "headline": values.title,
                                                "description": values.description,
                                                "author": { "@type": "Person", "name": "ApexSEO User" },
                                                "datePublished": new Date().toISOString().split('T')[0]
                                            }, null, 2)}</pre>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="advanced" className="space-y-6 m-0">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Canonical URL</Label>
                                            <Input {...register('canonicalUrl')} placeholder="https://..." />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Focus Keyphrase</Label>
                                            <Input {...register('focusKeyphrase')} />
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t">
                                        <Label className="text-base font-semibold">Robots Meta</Label>
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="index" className="cursor-pointer">Index this page</Label>
                                            <Switch id="index" checked={values.robotsIndex} onCheckedChange={c => setValue('robotsIndex', c)} />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="follow" className="cursor-pointer">Follow links</Label>
                                            <Switch id="follow" checked={values.robotsFollow} onCheckedChange={c => setValue('robotsFollow', c)} />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="archive" className="cursor-pointer">No Archive</Label>
                                            <Switch id="archive" checked={values.robotsNoArchive} onCheckedChange={c => setValue('robotsNoArchive', c)} />
                                        </div>
                                    </div>
                                </TabsContent>

                            </form>
                        </ScrollArea>
                    </Tabs>
                </div>

                <DialogFooter className="px-6 py-4 border-t bg-gray-50/50">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button type="submit" form="seo-form" className="bg-purple-600 hover:bg-purple-700">Save Metadata</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
