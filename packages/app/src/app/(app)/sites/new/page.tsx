"use client";
// New Project Page


import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

export default function NewProjectPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [domain, setDomain] = useState('');
    const [projectTypes, setProjectTypes] = useState<string[]>(['audit']);
    const [isLoading, setIsLoading] = useState(false);

    const toggleProjectType = (type: string) => {
        setProjectTypes(prev =>
            prev.includes(type)
                ? prev.filter(t => t !== type)
                : [...prev, type]
        );
    };

    const handleCreateProject = async () => {
        if (!name) return; // Basic validation

        setIsLoading(true);
        try {
            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    description,
                    domain,
                    types: projectTypes
                })
            });

            if (response.ok) {
                router.push('/projects');
            } else {
                console.error('Failed to create project');
            }
        } catch (error) {
            console.error('Error creating project:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (

        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <div className="flex items-center text-sm text-gray-500 mb-2">
                    <Link href="/projects" className="hover:text-white transition-colors">Projects</Link>
                    <span className="mx-2">/</span>
                    <span className="text-white">Create New</span>
                </div>
                <h1 className="text-3xl font-bold text-white">Create a New Project</h1>
            </div>

            <div className="space-y-6">
                {/* Basic Information Card */}
                <Card className="bg-[#151923] border-gray-800/50">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-white">Basic Information</CardTitle>
                        <CardDescription className="text-gray-400">Provide the essential details for your new project.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Input
                            label="Project Name *"
                            placeholder="e.g., Acme Corp Q4 Campaign"
                            className="bg-[#0B0E14] border-gray-700"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1.5">Project Description (optional)</label>
                            <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="A brief description of the project's goals."
                                className="bg-[#0B0E14] border-gray-700 min-h-[120px]"
                                maxLength={250}
                            />
                            <div className="text-right text-xs text-gray-500 mt-1">
                                {description.length} / 250 characters
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Initial Setup Card */}
                <Card className="bg-[#151923] border-gray-800/50">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-white">Initial Setup</CardTitle>
                        <CardDescription className="text-gray-400">Configure the core settings to get started.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Input
                            label="Primary Domain"
                            placeholder="e.g., yourwebsite.com"
                            className="bg-[#0B0E14] border-gray-700"
                            value={domain}
                            onChange={(e) => setDomain(e.target.value)}
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-3">Project Type</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div
                                    onClick={() => toggleProjectType('audit')}
                                    className={`cursor-pointer rounded-lg border p-4 flex items-center transition-all ${projectTypes.includes('audit')
                                        ? 'bg-blue-600/10 border-blue-500 ring-1 ring-blue-500'
                                        : 'bg-[#0B0E14] border-gray-700 hover:border-gray-600'
                                        }`}
                                >
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center mr-3 ${projectTypes.includes('audit') ? 'border-blue-500' : 'border-gray-500'}`}>
                                        {projectTypes.includes('audit') && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                                    </div>
                                    <span className={`text-sm font-medium ${projectTypes.includes('audit') ? 'text-white' : 'text-gray-300'}`}>Website Audit</span>
                                </div>

                                <div
                                    onClick={() => toggleProjectType('keyword')}
                                    className={`cursor-pointer rounded-lg border p-4 flex items-center transition-all ${projectTypes.includes('keyword')
                                        ? 'bg-blue-600/10 border-blue-500 ring-1 ring-blue-500'
                                        : 'bg-[#0B0E14] border-gray-700 hover:border-gray-600'
                                        }`}
                                >
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center mr-3 ${projectTypes.includes('keyword') ? 'border-blue-500' : 'border-gray-500'}`}>
                                        {projectTypes.includes('keyword') && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                                    </div>
                                    <span className={`text-sm font-medium ${projectTypes.includes('keyword') ? 'text-white' : 'text-gray-300'}`}>Keyword Research</span>
                                </div>

                                <div
                                    onClick={() => toggleProjectType('competitor')}
                                    className={`cursor-pointer rounded-lg border p-4 flex items-center transition-all ${projectTypes.includes('competitor')
                                        ? 'bg-blue-600/10 border-blue-500 ring-1 ring-blue-500'
                                        : 'bg-[#0B0E14] border-gray-700 hover:border-gray-600'
                                        }`}
                                >
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center mr-3 ${projectTypes.includes('competitor') ? 'border-blue-500' : 'border-gray-500'}`}>
                                        {projectTypes.includes('competitor') && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                                    </div>
                                    <span className={`text-sm font-medium ${projectTypes.includes('competitor') ? 'text-white' : 'text-gray-300'}`}>Competitor Analysis</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer Actions */}
                <div className="flex justify-end gap-3 pt-4">
                    <Link href="/projects">
                        <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-gray-800">Cancel</Button>
                    </Link>
                    <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                        onClick={handleCreateProject}
                        disabled={isLoading || !name}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            'Create Project'
                        )}
                    </Button>
                </div>
            </div>
        </div>

    );
}
