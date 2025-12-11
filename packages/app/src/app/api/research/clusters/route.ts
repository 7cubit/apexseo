import { NextResponse } from 'next/server';
import { TopicalMapService } from '@/lib/TopicalMapService';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    const service = new TopicalMapService();
    try {
        const { seedKeyword, projectId } = await req.json();

        if (!seedKeyword || !projectId) {
            return NextResponse.json({ error: 'Missing seedKeyword or projectId' }, { status: 400 });
        }

        const map = await service.generateTopicClusters(seedKeyword, projectId);
        return NextResponse.json(map);
    } catch (error) {
        console.error('Error generating topic clusters:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
