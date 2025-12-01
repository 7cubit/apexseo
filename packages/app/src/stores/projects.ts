import { create } from 'zustand';

interface ProjectsState {
    projects: any[];
    setProjects: (projects: any[]) => void;
}

export const useProjectsStore = create<ProjectsState>((set) => ({
    projects: [],
    setProjects: (projects) => set({ projects }),
}));
