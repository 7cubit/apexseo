import { NextRequest, NextResponse } from 'next/server';
import { createDataForSEOClient } from '@apexseo/shared';

export async function POST(req: NextRequest) {
    try {
        const { keyword, location_code, language_code, depth } = await req.json();

        const client = createDataForSEOClient();
        const data = await client.serp.getOrganic(keyword, location_code, language_code, depth);

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("SERP API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
