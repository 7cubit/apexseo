export interface Project {
    id: string;
    name: string;
    domain: string;
    user_id: string;
    created_at: string;
    site_doctor_enabled?: boolean;
    site_doctor_cron?: string;
    rank_tracker_enabled?: boolean;
    rank_tracker_cron?: string;
    // Legacy fields for compatibility if needed
    url?: string;
    createdAt?: string;
}

export interface GraphNode {
    id: string;
    label: string;
}

export interface GraphEdge {
    id: string;
    source: string;
    target: string;
}

export interface TsprResult {
    page_id: string;
    url: string;
    pr: number;
    tspr: number;
    cluster?: number;
    inlinks?: number;
}
