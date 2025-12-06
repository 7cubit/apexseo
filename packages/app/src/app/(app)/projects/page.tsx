'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Settings, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Project {
    id: string;
    name: string;
    siteId: string;
    identity: {
        name: string;
        colors: { primary: string; };
    };
    markets: Array<{
        name: string;
        locale: { country: string; };
    }>;
    archetypes: Array<{ name: string; }>;
    createdAt: string;
}

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProjects() {
            try {
                const res = await fetch('/api/projects');
                const json = await res.json();
                setProjects(json);
            } catch (error) {
                console.error("Failed to fetch projects", error);
            } finally {
                setLoading(false);
            }
        }
        fetchProjects();
    }, []);

    if (loading) return <div className="container mx-auto py-10">Loading Projects...</div>;

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Projects</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your sites and brand profiles.</p>
                </div>
                <Link href="/projects/new">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        New Project
                    </Button>
                </Link>
            </div>

            {projects.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed rounded-xl">
                    <h3 className="text-lg font-semibold">No projects found</h3>
                    <p className="text-muted-foreground mb-4">Get started by creating your first project.</p>
                    <Link href="/projects/new">
                        <Button>Create Project</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <Card key={project.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                <div>
                                    <CardTitle className="text-xl font-bold">{project.name}</CardTitle>
                                    <CardDescription className="mt-1">{project.identity?.name || project.name}</CardDescription>
                                </div>
                                <div className="w-8 h-8 rounded-full border" style={{ backgroundColor: project.identity?.colors?.primary || '#000' }}></div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-2 mb-4">
                                    <Badge variant="secondary">{project.markets?.[0]?.locale?.country || 'Global'}</Badge>
                                    <Badge variant="outline">{project.archetypes?.length || 0} Archetypes</Badge>
                                </div>
                                <div className="flex justify-between items-center mt-4">
                                    <Link href={`/dashboard?siteId=${project.siteId}`}>
                                        <Button size="sm">
                                            Dashboard
                                            <ExternalLink className="w-4 h-4 ml-2" />
                                        </Button>
                                    </Link>
                                    <Link href={`/projects/${project.id}/settings`}>
                                        <Button variant="ghost" size="icon">
                                            <Settings className="w-4 h-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
