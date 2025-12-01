import { NextResponse } from "next/server";
import { PageRepository } from "@/lib/neo4j/repositories/PageRepository";

import { driver, DATABASE } from "@/lib/neo4j/driver";

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const projectId = params.id;

    try {
        if (!driver) {
            return NextResponse.json(generateMockGraph(projectId));
        }

        const session = driver.session({ database: DATABASE });
        try {
            const result = await session.run(
                `
            MATCH (p:Page)-[:BELONGS_TO]->(:Project {id: $projectId})
            OPTIONAL MATCH (p)-[r:LINKS_TO]->(p2:Page)
            WHERE (p2)-[:BELONGS_TO]->(:Project {id: $projectId})
            RETURN p, r, p2
            LIMIT 500
            `,
                { projectId }
            );

            const nodes = new Map();
            const edges: any[] = [];

            result.records.forEach((record: any) => {
                const source = record.get('p').properties;
                const targetNode = record.get('p2');
                const relNode = record.get('r');

                if (source.page_id && !nodes.has(source.page_id)) {
                    nodes.set(source.page_id, {
                        id: source.page_id,
                        data: { label: source.url, ...source },
                        position: { x: Math.random() * 500, y: Math.random() * 500 }, // Initial random position
                        type: 'default' // React Flow node type
                    });
                }

                if (targetNode && relNode) {
                    const target = targetNode.properties;
                    const rel = relNode.properties;

                    if (target.page_id && !nodes.has(target.page_id)) {
                        nodes.set(target.page_id, {
                            id: target.page_id,
                            data: { label: target.url, ...target },
                            position: { x: Math.random() * 500, y: Math.random() * 500 },
                            type: 'default'
                        });
                    }

                    if (source.page_id && target.page_id) {
                        edges.push({
                            id: `${source.page_id}-${target.page_id}`,
                            source: source.page_id,
                            target: target.page_id,
                            label: rel.text || "link",
                            type: 'default' // React Flow edge type
                        });
                    }
                }
            });

            return NextResponse.json({ nodes: Array.from(nodes.values()), edges });

        } catch (error) {
            console.error("Error fetching graph:", error);
            return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
        } finally {
            await session.close();
        }
    } catch (error) {
        console.error("Error initializing driver or session:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

function generateMockGraph(projectId: string) {
    // Mock data for demonstration/testing without DB
    const nodes = [
        { id: '1', data: { label: 'Home', url: `https://${projectId}/` }, position: { x: 250, y: 5 }, type: 'default' },
        { id: '2', data: { label: 'About', url: `https://${projectId}/about` }, position: { x: 100, y: 100 }, type: 'default' },
        { id: '3', data: { label: 'Contact', url: `https://${projectId}/contact` }, position: { x: 400, y: 100 }, type: 'default' },
        { id: '4', data: { label: 'Blog', url: `https://${projectId}/blog` }, position: { x: 250, y: 200 }, type: 'default' },
    ];
    const edges = [
        { id: 'e1-2', source: '1', target: '2', label: 'About Us' },
        { id: 'e1-3', source: '1', target: '3', label: 'Contact' },
        { id: 'e1-4', source: '1', target: '4', label: 'Read Blog' },
        { id: 'e2-1', source: '2', target: '1', label: 'Home' },
    ];
    return { nodes, edges };
}
