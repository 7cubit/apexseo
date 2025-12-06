import { NextResponse } from 'next/server';
import { triggerContentGeneration } from '@/workflows/content-generation/client';
import { EEATRequest } from '@/workflows/content-generation/types';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { topic, targetKeyword, projectId, userId, tone, wordCount, includeImages } = body;

        if (!topic || !targetKeyword || !projectId) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const input: EEATRequest = {
            topic,
            targetKeyword,
            projectId,
            userId: userId || 'anonymous',
            tone,
            wordCount,
            includeImages
        };

        const workflowId = await triggerContentGeneration(input);

        return NextResponse.json({
            taskId: workflowId,
            status: 'STARTED',
            message: `Content generation started for "${topic}"`
        });

    } catch (error) {
        console.error('Failed to trigger content generation:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
