import { NextRequest, NextResponse } from 'next/server';
import { HealthScoreService } from '@apexseo/shared';
import { ClickHouseHealthScoreRepository } from '@/lib/clickhouse/repositories/ClickHouseHealthScoreRepository';
import { ClickHousePageRepository } from '@/lib/clickhouse/repositories/ClickHousePageRepository';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const [latestScores, history] = await Promise.all([
            ClickHouseHealthScoreRepository.getLatestScores(id),
            ClickHouseHealthScoreRepository.getHistory(id)
        ]);

        // Enrich with page details (URL, etc.)
        // We need to fetch page details because health scores only have page_id
        // Ideally, we'd do a JOIN in ClickHouse, but for now we'll fetch pages and map in JS
        const pages = await ClickHousePageRepository.getPagesBySite(id);
        const pageMap = new Map(pages.map((p: any) => [p.page_id, p]));

        const enrichedScores = latestScores.map((score: any) => {
            const page = pageMap.get(score.page_id);
            return {
                ...score,
                url: page?.url || 'Unknown',
                recommendation: HealthScoreService.getSuggestion(score.health_score, {
                    tspr: score.tspr_component,
                    content: score.content_component,
                    ux: score.ux_component,
                    truth: score.truth_component,
                    backlinks: score.backlink_component
                })
            };
        });

        // Calculate overall site health (average of all pages)
        const overallHealth = enrichedScores.length > 0
            ? enrichedScores.reduce((sum: number, s: any) => sum + s.health_score, 0) / enrichedScores.length
            : 0;

        // Calculate component averages
        const components = {
            tspr: enrichedScores.reduce((sum: number, s: any) => sum + s.tspr_component, 0) / (enrichedScores.length || 1),
            content: enrichedScores.reduce((sum: number, s: any) => sum + s.content_component, 0) / (enrichedScores.length || 1),
            ux: enrichedScores.reduce((sum: number, s: any) => sum + s.ux_component, 0) / (enrichedScores.length || 1),
            truth: enrichedScores.reduce((sum: number, s: any) => sum + s.truth_component, 0) / (enrichedScores.length || 1),
            backlinks: enrichedScores.reduce((sum: number, s: any) => sum + s.backlink_component, 0) / (enrichedScores.length || 1),
            links: enrichedScores.reduce((sum: number, s: any) => sum + s.link_health_component, 0) / (enrichedScores.length || 1),
        };

        return NextResponse.json({
            overallHealth: Math.round(overallHealth),
            components,
            scores: enrichedScores,
            history
        });
    } catch (error) {
        console.error('Failed to fetch health scores:', error);
        return NextResponse.json({ error: 'Failed to fetch health scores' }, { status: 500 });
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const scores = await HealthScoreService.calculateAndSave(id);
        return NextResponse.json({ success: true, count: scores.length });
    } catch (error) {
        console.error('Failed to calculate health scores:', error);
        return NextResponse.json({ error: 'Failed to calculate scores' }, { status: 500 });
    }
}
