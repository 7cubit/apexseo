import { NextResponse } from 'next/server';
import { ClickHouseHealthScoreRepository } from '@apexseo/shared';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const siteId = params.id; // In real app, map project ID to site ID or domain
    // Ideally we fetch the project to get the domain/siteId
    // For now assuming id IS the siteId or we use it directly

    try {
        const scores = await ClickHouseHealthScoreRepository.getLatestScores(siteId);
        return NextResponse.json(scores);
    } catch (error) {
        console.error('Error fetching scores:', error);
        return NextResponse.json({ error: 'Failed to fetch scores' }, { status: 500 });
    }
}
