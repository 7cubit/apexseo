import { NextResponse } from 'next/server';

export async function GET() {
    // In a real app, we would check actual service connectivity here.
    // For now, we'll return mocked status based on env vars presence.

    const integrations = [
        {
            name: 'Stripe',
            status: process.env.STRIPE_SECRET_KEY ? 'Connected' : 'Not Configured',
            type: 'Payment'
        },
        {
            name: 'SendGrid',
            status: process.env.SENDGRID_API_KEY ? 'Connected' : 'Not Configured',
            type: 'Email'
        },
        {
            name: 'S3 / R2',
            status: process.env.S3_BUCKET ? 'Connected' : 'Not Configured',
            type: 'Storage'
        },
        {
            name: 'OpenAI',
            status: process.env.OPENAI_API_KEY ? 'Connected' : 'Not Configured',
            type: 'AI'
        }
    ];

    return NextResponse.json({ integrations });
}
