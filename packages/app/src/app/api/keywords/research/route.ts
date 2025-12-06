import { NextRequest, NextResponse } from 'next/server';
import { createDataForSEOClient } from '@apexseo/shared';

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const query = searchParams.get('query');

        if (!query) {
            return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
        }

        const client = createDataForSEOClient();

        // Use getKeywordSuggestions to find related keywords
        // Note: DataForSEO might return a complex structure, we need to map it
        const suggestions = (await client.keywords.getKeywordSuggestions([query])) as any[];

        const keywords = suggestions.map((item: any) => ({
            keyword: item.keyword,
            search_volume: item.keyword_info?.search_volume || 0,
            keyword_difficulty: item.keyword_properties?.keyword_difficulty || 0,
            cpc: item.keyword_info?.cpc || 0,
            serp_features: item.serp_info?.serp_features || [],
            trend: item.keyword_info?.monthly_searches?.map((ms: any) => ms.search_volume) || []
        }));

        return NextResponse.json({ keywords });
    } catch (error: any) {
        console.error("Keyword Research API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
