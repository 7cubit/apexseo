import { NextResponse } from 'next/server';
import { driver, DATABASE } from '@/lib/neo4j/driver';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
    if (!driver) return NextResponse.json({ error: 'Neo4j driver not initialized' }, { status: 500 });

    const session = driver.session({ database: DATABASE });
    const createdProjects = [];

    try {
        // 1. Find Sites without a Project
        const result = await session.run(`
            MATCH (s:Site)
            WHERE NOT (s)<-[:MANAGES]-(:Project)
            RETURN s
        `);

        for (const record of result.records) {
            const siteProps = record.get('s').properties;
            const siteId = siteProps.id;
            const url = siteProps.url;

            // Generate Project Data
            const projectId = uuidv4();
            const projectName = new URL(url).hostname.replace('www.', '');
            const now = new Date().toISOString();

            // 2. Create Project and Link
            await session.run(`
                MERGE (p:Project {id: $projectId})
                SET p.name = $projectName,
                    p.site_id = $siteId,
                    p.created_at = datetime($now),
                    p.updated_at = datetime($now),
                    p.branding = $branding,
                    p.settings = $settings
                
                WITH p
                MATCH (s:Site {id: $siteId})
                MERGE (p)-[:MANAGES]->(s)
                SET s.project_id = $projectId
            `, {
                projectId,
                projectName,
                siteId,
                now,
                branding: JSON.stringify({
                    name: projectName,
                    colors: { primary: '#000000', secondary: '#ffffff', accent: '#3b82f6' },
                    voice: { tone: 'Professional', style: '' },
                    audience: { demographic: 'General', painPoints: [] }
                }),
                settings: JSON.stringify({
                    crawlFrequency: 'Weekly',
                    trackCompetitors: true,
                    notifications: { email: true, slack: false }
                })
            });

            createdProjects.push({ projectId, siteId, name: projectName });
        }

        return NextResponse.json({
            message: `Migrated ${createdProjects.length} sites to projects`,
            projects: createdProjects
        });

    } catch (error) {
        console.error('Migration failed:', error);
        return NextResponse.json({ error: 'Migration failed' }, { status: 500 });
    } finally {
        await session.close();
    }
}
