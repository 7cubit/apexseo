'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function ProjectSettingsPage() {
    const params = useParams();
    const router = useRouter();
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        async function fetchProject() {
            try {
                const res = await fetch(`/api/projects/${params.id}`);
                if (!res.ok) throw new Error('Failed to fetch');
                const json = await res.json();
                setProject(json);
            } catch (error) {
                console.error("Failed to fetch project", error);
            } finally {
                setLoading(false);
            }
        }
        fetchProject();
    }, [params.id]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/projects/${params.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: project.name,
                    branding: project.branding,
                    settings: project.settings
                })
            });
            if (res.ok) {
                router.push('/projects');
            }
        } catch (error) {
            console.error("Failed to save project", error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="container mx-auto py-10">Loading Settings...</div>;
    if (!project) return <div className="container mx-auto py-10">Project not found</div>;

    return (
        <div className="container mx-auto py-10 max-w-4xl">
            <div className="flex items-center mb-8">
                <Link href="/projects" className="mr-4">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold">Project Settings</h1>
                    <p className="text-muted-foreground mt-1">Configure branding and preferences for {project.name}</p>
                </div>
            </div>

            <div className="grid gap-6">
                {/* General Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>General Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Project Name</Label>
                            <Input
                                id="name"
                                value={project.name}
                                onChange={(e) => setProject({ ...project, name: e.target.value })}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Branding Profile */}
                <Card>
                    <CardHeader>
                        <CardTitle>Branding Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Primary Color</Label>
                                <div className="flex gap-2">
                                    <div className="w-10 h-10 rounded border" style={{ backgroundColor: project.branding.colors.primary }}></div>
                                    <Input
                                        value={project.branding.colors.primary}
                                        onChange={(e) => setProject({
                                            ...project,
                                            branding: { ...project.branding, colors: { ...project.branding.colors, primary: e.target.value } }
                                        })}
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>Tone of Voice</Label>
                                <Select
                                    value={project.branding.voice.tone}
                                    onValueChange={(val) => setProject({
                                        ...project,
                                        branding: { ...project.branding, voice: { ...project.branding.voice, tone: val } }
                                    })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select tone" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Professional">Professional</SelectItem>
                                        <SelectItem value="Casual">Casual</SelectItem>
                                        <SelectItem value="Authoritative">Authoritative</SelectItem>
                                        <SelectItem value="Witty">Witty</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>Target Audience</Label>
                            <Input
                                value={project.branding.audience.demographic}
                                onChange={(e) => setProject({
                                    ...project,
                                    branding: { ...project.branding, audience: { ...project.branding.audience, demographic: e.target.value } }
                                })}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* System Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>System Preferences</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label>Crawl Frequency</Label>
                            <Select
                                value={project.settings.crawlFrequency}
                                onValueChange={(val) => setProject({
                                    ...project,
                                    settings: { ...project.settings, crawlFrequency: val }
                                })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Daily">Daily</SelectItem>
                                    <SelectItem value="Weekly">Weekly</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={saving}>
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
