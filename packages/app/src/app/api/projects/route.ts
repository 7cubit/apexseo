import { NextResponse } from 'next/server';
import { ProjectRepository, Project } from '@/lib/neo4j/repositories/ProjectRepository';
import { SiteRepository } from '@/lib/neo4j/repositories/SiteRepository';
import { driver, DATABASE } from '@/lib/neo4j/driver';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, siteId: existingSiteId, markets, identity, archetypes, knowledgeGraph, settings } = body;

        if (!name || !markets || markets.length === 0) {
            return NextResponse.json({ error: 'Name and at least one Market are required' }, { status: 400 });
        }

        // 1. Create or Get Site
        let siteId = existingSiteId;
        if (!siteId) {
            siteId = uuidv4();
            // Use the first market's domain/url logic or a provided homeUrl if we had one.
            // For V3, let's assume the first market defines the primary URL context or we pass it explicitly.
            // Simplified: Use a placeholder or derive from identity/market.
            await SiteRepository.createOrUpdateSite({
                id: siteId,
                url: `https://${identity.name.toLowerCase().replace(/\s+/g, '')}.com`, // Fallback
                projectId: '',
                lastCrawled: new Date().toISOString()
            });
        }

        // 2. Create Project
        const projectId = uuidv4();
        const newProject: Project = {
            id: projectId,
            name,
            siteId,
            settings: settings || { crawlFrequency: 'Weekly', trackCompetitors: true },
            markets: markets || [],
            identity: identity || { name, colors: { primary: '#000', secondary: '#fff', accent: '#3b82f6' }, bannedWords: [], boilerplate: '' },
            archetypes: archetypes || [],
            knowledgeGraph: knowledgeGraph || { products: [], usps: [], personnel: [] },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await ProjectRepository.createProject(newProject);

        // 3. Update Site with Project ID
        await SiteRepository.createOrUpdateSite({
            id: siteId,
            url: `https://${identity.name.toLowerCase().replace(/\s+/g, '')}.com`,
            projectId: projectId
        });

        return NextResponse.json(newProject);
    } catch (error) {
        console.error('Error creating project:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get('siteId');

    if (siteId) {
        const project = await ProjectRepository.findProjectBySiteId(siteId);
        return NextResponse.json(project || {});
    }

    // List all projects (uses repository with mock fallback)
    try {
        const projects = await ProjectRepository.getAllProjects();
        return NextResponse.json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        // Even if repository fails, return empty array (though repo should handle mocks)
        return NextResponse.json([], { status: 500 });
    }
}
