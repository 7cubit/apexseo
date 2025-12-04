import { NextResponse } from 'next/server';
import { ProjectRepository, ClickHouseProjectRepository } from '@apexseo/shared';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        // Fetch Neo4j data (owner, plan, etc.)
        const projectList = await ProjectRepository.listWithDetails(1, 0, undefined);
        // Note: listWithDetails is not ideal for getById, but for now we can filter or assume we'd add getByIdWithDetails later.
        // Let's assume we need to implement getByIdWithDetails or just fetch basic info + metrics.
        // Actually, let's use ClickHouseProjectRepository.getById for basic info and augment it.

        const project = await ClickHouseProjectRepository.getById(params.id);
        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        const metrics = await ClickHouseProjectRepository.getMetrics(params.id);
        const crawlLogs = await ClickHouseProjectRepository.getCrawlLogs(params.id);

        return NextResponse.json({
            project,
            metrics,
            crawlLogs
        });
    } catch (error) {
        console.error('Error fetching project details:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
