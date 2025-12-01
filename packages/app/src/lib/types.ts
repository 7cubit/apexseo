export interface Project {
    id: string;
    url: string;
    createdAt: string;
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
