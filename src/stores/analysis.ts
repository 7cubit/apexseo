import { create } from 'zustand';

interface AnalysisState {
    results: any;
    setResults: (results: any) => void;
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
    results: null,
    setResults: (results) => set({ results }),
}));
