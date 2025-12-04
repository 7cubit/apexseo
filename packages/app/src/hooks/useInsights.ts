import useSWR from 'swr';
import { apiClient } from '@/lib/api';

export interface ProjectOverview {
    totalPages: number;
    avgContentScore: number;
    lastCrawl: string | null;
}

export interface Page {
    site_id: string;
    page_id: string;
    url: string;
    title?: string;
    content_score?: number;
    word_count?: number;
    status?: string;
    crawled_at?: string;
    is_orphan?: number;
    link_count_internal?: number;
    link_count_external?: number;
}

export interface LinkSuggestion {
    source_page_id: string;
    target_page_id: string;
    anchor_text: string;
    relevance_score: number;
    reason: string;
}

const fetcher = (url: string) => apiClient(url);

export function useProjectOverview(projectId: string) {
    const { data, error, isLoading } = useSWR<ProjectOverview>(
        projectId ? `/projects/${projectId}/overview` : null,
        fetcher
    );

    return {
        data,
        isLoading,
        error
    };
}

export function useProjectPages(projectId: string, page: number = 1, limit: number = 10) {
    const { data, error, isLoading } = useSWR<{ pages: Page[], total: number }>(
        projectId ? `/projects/${projectId}/pages?page=${page}&limit=${limit}` : null,
        fetcher
    );

    return {
        data,
        isLoading,
        error
    };
}

export function usePageAudit(projectId: string, pageId: string) {
    const { data, error, isLoading } = useSWR<Page>(
        projectId && pageId ? `/projects/${projectId}/pages/${pageId}/audit` : null,
        fetcher
    );

    return {
        data,
        isLoading,
        error
    };
}

export function useInternalLinkRecommendations(projectId: string) {
    const { data, error, isLoading } = useSWR<LinkSuggestion[]>(
        projectId ? `/projects/${projectId}/internal-links` : null,
        fetcher
    );

    return {
        data,
        isLoading,
        error
    };
}
