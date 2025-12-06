import { NextResponse } from 'next/server';
import { EEATService, EEATRequest } from '@/lib/eeat-service';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { topic, keywords, brandVoice, category, audienceLevel, perspective, providers, apiKeys } = body as EEATRequest & { apiKeys?: { openai?: string; perplexity?: string } };

        if (!topic) {
            return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
        }

        const service = new EEATService();
        const result = await service.generateEEATContent({
            topic,
            keywords: keywords || [],
            brandVoice: brandVoice || 'Professional',
            category: category || 'General',
            audienceLevel: audienceLevel || 'Intermediate',
            perspective: perspective || 'Second Person (You)',
            providers: providers || { research: 'perplexity', drafting: 'openai' },
            projectId: body.projectId // Pass projectId
        }, apiKeys);

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('EEAT Workflow Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
