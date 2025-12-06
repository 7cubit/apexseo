import { create } from 'zustand';

export interface KeywordUsage {
    keyword: string;
    count: number;
    target: number;
    status: 'missing' | 'optimal' | 'overused';
}

export interface HeadingStatus {
    text: string;
    level: number;
    present: boolean;
}

export interface Fact {
    id: string;
    text: string;
    source: string;
    sourceUrl: string;
    used: boolean;
}

export interface OutlineNode {
    id: string;
    text: string;
    level: number;
    targetWordCount: number;
    entities: string[];
    status: 'complete' | 'needs_detail' | 'not_started';
}

interface EditorState {
    // Editor Content
    content: string;
    wordCount: number;
    readingTime: number; // minutes

    // Status
    isSaving: boolean;
    lastSaved: Date | null;

    // SEO Score Data
    overallScore: number;
    subscores: {
        trust: number;
        semantic: number;
        citations: number;
    };

    // Guidelines
    targetWordCount: number;
    keywords: KeywordUsage[];
    headings: HeadingStatus[];

    // Research Data
    facts: Fact[];
    outline: OutlineNode[];

    // Metadata
    title: string;
    metaDescription: string;
    primaryKeyword: string;

    // Actions
    setContent: (content: string, wordCount: number) => void;
    setMetadata: (data: { title?: string; metaDescription?: string; primaryKeyword?: string }) => void;
    setSaving: (isSaving: boolean) => void;
    updateScore: (data: Partial<EditorState>) => void;
    toggleFactUsed: (id: string) => void;
    updateOutlineStatus: (id: string, status: OutlineNode['status']) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
    content: '',
    wordCount: 0,
    readingTime: 0,

    // Metadata
    title: '',
    metaDescription: '',
    primaryKeyword: '',

    isSaving: false,
    lastSaved: null,

    overallScore: 65, // Mock initial
    subscores: {
        trust: 80,
        semantic: 60,
        citations: 4
    },

    targetWordCount: 2100,
    keywords: [
        { keyword: 'wordpress security', count: 5, target: 8, status: 'optimal' },
        { keyword: 'malware scanning', count: 2, target: 4, status: 'missing' },
        { keyword: 'two-factor authentication', count: 0, target: 3, status: 'missing' },
    ],
    headings: [
        { text: 'What is WordPress Security', level: 2, present: true },
        { text: 'Common Security Threats', level: 2, present: false },
    ],

    facts: [
        { id: 'f1', text: '53% of all web traffic comes from organic search', source: 'HigherVisibility', sourceUrl: '#', used: false },
        { id: 'f2', text: 'WordPress powers 43% of websites', source: 'W3Techs', sourceUrl: '#', used: false },
    ],
    outline: [
        { id: 'o1', text: 'Introduction', level: 2, targetWordCount: 200, entities: ['WordPress', 'Security'], status: 'complete' },
        { id: 'o2', text: 'Common Threats', level: 2, targetWordCount: 500, entities: ['Malware', 'Brute Force'], status: 'needs_detail' },
    ],

    setContent: (content, wordCount) => set({
        content,
        wordCount,
        readingTime: Math.ceil(wordCount / 200)
    }),

    setMetadata: (data) => set((state) => ({ ...state, ...data })),

    setSaving: (isSaving) => set({ isSaving, lastSaved: isSaving ? null : new Date() }),

    updateScore: (data) => set((state) => ({ ...state, ...data })),

    toggleFactUsed: (id) => set((state) => ({
        facts: state.facts.map(f => f.id === id ? { ...f, used: !f.used } : f)
    })),

    updateOutlineStatus: (id, status) => set((state) => ({
        outline: state.outline.map(o => o.id === id ? { ...o, status } : o)
    }))
}));
