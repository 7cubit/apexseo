export interface GapFillWorkflowInput {
    cluster_id: string; // UUID
    my_domain: string;
    topic_id: string; // UUID
    top_competitor_domain: string;
    user_id: string; // UUID
}

export interface ContentBrief {
    suggested_title: string;
    outline: string[];
    required_entities: string[];
    faq_questions: string[];
    internal_linking: Array<{
        source_page: string;
        anchor: string;
        target_keyword: string;
    }>;
    estimated_word_count: number;
    content_angle: string;
    missing_keywords: string[];
    competitor_summary: string;
}

export interface GapFillWorkflowOutput {
    task_id: string; // UUID
    brief_json: ContentBrief;
    status: 'COMPLETED' | 'FAILED';
    created_at: Date;
    execution_time_ms: number;
}

// Activity Types

export interface ClusterDetails {
    cluster_id: string;
    cluster_name: string;
    all_keywords: string[];
    missing_keywords: string[]; // Keywords competitor has but we don't
}

export interface CompetitorContent {
    url: string;
    keyword: string;
    title: string;
    content_snippet: string; // First 1000 chars or relevant section
}

export interface ExtractedEntities {
    entities: string[];
    missing_entities: string[]; // Entities found in competitor content but not ours (if we had content)
}
