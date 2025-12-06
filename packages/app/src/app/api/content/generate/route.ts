import { NextResponse } from 'next/server';
import { contentGenerationSchema } from '@/lib/schemas/content-generation';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validate input
        const validation = contentGenerationSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: validation.error.format() },
                { status: 400 }
            );
        }

        const data = validation.data;

        // In a real implementation, we would:
        // 1. Connect to Temporal Client
        // 2. Start 'ContentGenerationWorkflow'
        // 3. Return the workflowId

        // Mocking the workflow trigger
        const workflowId = `content-gen-${Date.now()}`;

        console.log(`Starting Content Generation Workflow [${workflowId}] for keyword: ${data.targetKeyword}`);

        // Simulate processing delay if needed, but usually we return immediately

        return NextResponse.json({
            taskId: workflowId,
            status: 'STARTED',
            message: 'Content generation started successfully'
        });

    } catch (error) {
        console.error('Failed to start content generation:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
