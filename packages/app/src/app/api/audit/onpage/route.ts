import { NextRequest, NextResponse } from 'next/server';
import { createDataForSEOClient } from '@apexseo/shared';

export async function POST(req: NextRequest) {
    try {
        const { url } = await req.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        const client = createDataForSEOClient();

        // Trigger Lighthouse Audit
        // Note: This is usually async/webhook based in production for large sites, 
        // but for a single page "Instant" audit we can try the live endpoint if available 
        // or use the instant_pages endpoint which is faster.

        // Using getInstantPages for real-time feedback
        const data = await client.onPage.getInstantPages(url);

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("OnPage Audit API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
