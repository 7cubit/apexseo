import { create } from 'zustand';
import { api } from '../api';

interface AnalysisResult {
    id: string;
    projectId: string;
    status: 'pending' | 'completed' | 'failed';
    score: number;
    issues: any[];
    createdAt: string;
}

interface AnalysisState {
    results: AnalysisResult[];
    currentAnalysis: AnalysisResult | null;
    isLoading: boolean;
    error: string | null;
    fetchAnalysis: (projectId: string) => Promise<void>;
    startAnalysis: (projectId: string) => Promise<void>;
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
    results: [],
    currentAnalysis: null,
    isLoading: false,
    error: null,

    fetchAnalysis: async (projectId: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get(`/projects/${projectId}/analysis`);
            set({ results: response.data, isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    startAnalysis: async (projectId: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post(`/projects/${projectId}/analysis`);
            set((state) => ({
                results: [response.data, ...state.results],
                currentAnalysis: response.data,
                isLoading: false
            }));
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    }
}));
