import { create } from 'zustand';
import { api } from '../api';

interface Project {
    id: string;
    name: string;
    domain: string;
    status: 'active' | 'archived';
}

interface ProjectState {
    projects: Project[];
    currentProject: Project | null;
    isLoading: boolean;
    error: string | null;
    fetchProjects: () => Promise<void>;
    setCurrentProject: (project: Project) => void;
    createProject: (data: Partial<Project>) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set) => ({
    projects: [],
    currentProject: null,
    isLoading: false,
    error: null,

    fetchProjects: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get('/projects');
            set({ projects: response.data, isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    setCurrentProject: (project) => set({ currentProject: project }),

    createProject: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post('/projects', data);
            set((state) => ({
                projects: [...state.projects, response.data],
                isLoading: false
            }));
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    }
}));
