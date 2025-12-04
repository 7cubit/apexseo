'use client';

import { useEffect, useState } from 'react';
import { Card, Input, Button } from '@apexseo/ui';
import Link from 'next/link';

interface Project {
    id: string;
    name: string;
    domain: string;
    createdAt: string;
    crawlStatus?: string;
    owner?: { email: string };
    plan?: { name: string };
}

export default function AdminProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchProjects();
    }, [searchTerm]);

    const fetchProjects = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);

            const res = await fetch(`/api/admin/projects?${params.toString()}`);
            const data = await res.json();
            if (data.projects) {
                setProjects(data.projects);
            }
        } catch (error) {
            console.error('Failed to fetch projects:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
                <Link href="/admin/projects/blocked">
                    <Button variant="outline">Manage Blocked Domains</Button>
                </Link>
            </div>

            <Card className="p-6">
                <div className="mb-6">
                    <Input
                        placeholder="Search projects by name or domain..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-md"
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="py-3 px-4 text-sm font-semibold text-gray-700">Project</th>
                                <th className="py-3 px-4 text-sm font-semibold text-gray-700">Owner</th>
                                <th className="py-3 px-4 text-sm font-semibold text-gray-700">Plan</th>
                                <th className="py-3 px-4 text-sm font-semibold text-gray-700">Crawl Status</th>
                                <th className="py-3 px-4 text-sm font-semibold text-gray-700">Created</th>
                                <th className="py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={6} className="py-8 text-center text-gray-500">Loading projects...</td></tr>
                            ) : projects.length === 0 ? (
                                <tr><td colSpan={6} className="py-8 text-center text-gray-500">No projects found.</td></tr>
                            ) : (
                                projects.map((project) => (
                                    <tr key={project.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4">
                                            <div className="font-medium text-gray-900">{project.name}</div>
                                            <div className="text-sm text-gray-500">{project.domain}</div>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-600">
                                            {project.owner?.email || '-'}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-600">
                                            {project.plan?.name || 'Free'}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${project.crawlStatus === 'CRAWLING' ? 'bg-blue-100 text-blue-800' :
                                                    project.crawlStatus === 'PAUSED' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-gray-100 text-gray-800'
                                                }`}>
                                                {project.crawlStatus || 'IDLE'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-500">
                                            {new Date(project.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="py-3 px-4">
                                            <Link
                                                href={`/admin/projects/${project.id}`}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                            >
                                                Manage
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
