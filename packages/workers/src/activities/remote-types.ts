export interface ComputeActivities {
    calculate_cannibalization(domain: string): Promise<{ score: number; conflicts: any[] }>;
    compute_content_score(content: string, keyword: string): Promise<number>;
}

export interface DataActivities {
    IngestSerpData(data: { Keyword: string; Items: any[] }): Promise<string>;
    GetGraphNeighbors(url: string): Promise<string[]>;
}
