import { NextRequest, NextResponse } from 'next/server';
import { ClickHouseRankRepository } from '@/lib/clickhouse/repositories/ClickHouseRankRepository';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '30', 10);
    const keyword = searchParams.get('keyword');

    // If a specific keyword is requested, we can filter by it
    // But the requirements ask for fetching history for the chart which usually needs all keywords
    // Or we can fetch all and let frontend filter.
    // Let's implement fetching all history for the site within the date range.

    // We need a method in repository to get history for all keywords of a site
    // Currently we only have getHistory(siteId, keyword, limit)
    // We should probably add getSiteRankHistory(siteId, days) to repository or use raw query here.
    // For better abstraction, let's add it to the repository first or just use a raw query here if we want to move fast.
    // Given the instructions, let's stick to the plan and maybe update the repository if needed.
    // But wait, the repository method `getHistory` takes a keyword.
    // We need to fetch all keywords.

    // Let's update the repository to support fetching all history for a site.
    // But first, let's see if we can just fetch distinct keywords and then history for each? No that's inefficient.
    // We should query: SELECT * FROM rank_history WHERE site_id = ... AND timestamp > now() - days

    // I will implement a new method in the repository via a separate tool call or just put the query here if I can access the client.
    // Accessing client directly here is fine for now but better to use repository.
    // I'll assume I can add a method to the repository or just use the existing one if I modify it.
    // Actually, I'll just implement the query here using the client directly for now to save a step, 
    // or better, I will update the repository in the next step if I can.
    // Let's check `ClickHouseRankRepository.ts` again.

    // I'll implement the route to use a new method `getSiteHistory` which I will add to the repository.

    try {
        const history = await ClickHouseRankRepository.getSiteHistory(id, days);
        return NextResponse.json({ history });
    } catch (error) {
        console.error('Failed to fetch rank history:', error);
        return NextResponse.json({ error: 'Failed to fetch rank history' }, { status: 500 });
    }
}
