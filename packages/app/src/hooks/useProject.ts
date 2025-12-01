import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';

export function useProject(projectId?: string) {
    const [project, setProject] = useState<any>(null);
    const [projects, setProjects] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProjects = async () => {
            setIsLoading(true);
            try {
                if (projectId) {
                    const data = await apiClient(`/projects/${projectId}`);
                    setProject(data.project);
                } else {
                    const data = await apiClient('/projects');
                    setProjects(data.projects);
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProjects();
    }, [projectId]);

    return { project, projects, isLoading, error };
}
