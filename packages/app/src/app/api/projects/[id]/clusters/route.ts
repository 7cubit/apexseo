import { NextResponse } from 'next/server';
import { ClickHouseClusterStore } from '@apexseo/shared';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const siteId = params.id;

    try {
        const clusters = await ClickHouseClusterStore.getClusters(siteId);
        return NextResponse.json(clusters);
    } catch (error) {
        console.error('Error fetching clusters:', error);
        return NextResponse.json({ error: 'Failed to fetch clusters' }, { status: 500 });
    }
}
