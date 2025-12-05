import { NextResponse } from 'next/server';
import { ProjectRepository } from '@/lib/neo4j/repositories/ProjectRepository';
import { driver, DATABASE } from '@/lib/neo4j/driver';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const project = await ProjectRepository.findProjectById(params.id);
    if (!project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    return NextResponse.json(project);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const body = await request.json();
        const { name, branding, settings } = body;

        if (!driver) return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });
        const session = driver.session({ database: DATABASE });

        try {
            await session.run(`
                MATCH (p:Project {id: $id})
                SET p.name = $name,
                    p.branding = $branding,
                    p.settings = $settings,
                    p.updated_at = datetime()
                RETURN p
            `, {
                id: params.id,
                name,
                branding: JSON.stringify(branding),
                settings: JSON.stringify(settings)
            });

            return NextResponse.json({ message: 'Project updated successfully' });
        } finally {
            await session.close();
        }
    } catch (error) {
        console.error('Error updating project:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
