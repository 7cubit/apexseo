import { ClickHouseScoreRepository, ClickHousePageRepository } from '@apexseo/shared';

export async function saveScoreToClickHouse(record: any): Promise<void> {
    await ClickHouseScoreRepository.addScore(record);
}

export async function getPagesForProject(projectId: string): Promise<any[]> {
    const { client } = await import('@apexseo/shared');
    if (!client) return [];

    const result = await client.query({
        query: `SELECT url, content FROM pages WHERE site_id = {projectId:String} LIMIT 10`,
        query_params: { projectId },
        format: 'JSONEachRow'
    });

    return await result.json() as any[];
}

export async function calculateCompositeScore(url: string): Promise<void> {
    console.log(`Calculating composite score for ${url}...`);
    // Mock implementation:
    // 1. Fetch latest metrics (TSPR, content depth, etc.)
    // 2. Compute score
    // 3. Save to ClickHouse

    const mockScore = Math.floor(Math.random() * 100);
    await ClickHouseScoreRepository.addScore({
        url,
        score: mockScore,
        created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
    });
}
