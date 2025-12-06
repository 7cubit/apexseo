export interface EEATRequest {
    topic: string;
    targetKeyword: string;
    projectId: string;
    userId: string;
    tone?: string;
    wordCount?: number;
    includeImages?: boolean;
}

export interface ResearchData {
    facts: string[];
    sources: string[];
    competitorInsights: string[];
    semanticKeywords: string[];
}

export interface ContentArchitecture {
    outline: string[];
    headings: string[];
    intent: string;
    targetAudience: string;
}

export interface DraftContent {
    content: string;
    metadata: {
        wordCount: number;
        readingTime: number;
    };
}

export interface ScoredContent extends DraftContent {
    score: number;
    eeatScore: {
        experience: number;
        expertise: number;
        authoritativeness: number;
        trustworthiness: number;
    };
    targetKeyword: string;
    projectId: string;
}
