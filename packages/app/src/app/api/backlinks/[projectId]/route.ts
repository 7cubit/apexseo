import { NextRequest, NextResponse } from 'next/server';
import { createDataForSEOClient } from '@apexseo/shared';

export async function GET(req: NextRequest, { params }: { params: { projectId: string } }) {
    try {
        const { projectId } = params;
        const client = createDataForSEOClient();

        // Fetch summary
        const summaryResponse = (await client.backlinks.getSummary(projectId)) as any;
        const summaryData = summaryResponse.tasks?.[0]?.result?.[0];

        // Fetch backlinks list
        const backlinksResponse = (await client.backlinks.getBacklinks(projectId, 20)) as any; // Limit to 20 for overview
        const backlinksData = backlinksResponse.tasks?.[0]?.result?.[0]?.items || [];

        const summary = {
            total: summaryData?.total_backlinks || 0,
            referring_domains: summaryData?.referring_domains || 0,
            new_last_30: 0, // Not directly available in simple summary, would need history endpoint
            lost_last_30: 0
        };

        const backlinks = backlinksData.map((item: any) => ({
            url_from: item.url_from,
            url_to: item.url_to,
            anchor: item.anchor,
            rank: item.rank,
            first_seen: item.first_seen
        }));

        return NextResponse.json({
            summary,
            backlinks
        });
    } catch (error: any) {
        console.error("Backlinks API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
