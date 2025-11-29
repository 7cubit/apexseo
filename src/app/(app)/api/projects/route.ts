import { NextResponse } from "next/server";
import { ProjectRepository } from "@/lib/neo4j/repositories/ProjectRepository";
import { SiteRepository } from "@/lib/neo4j/repositories/SiteRepository";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, description, domain, types } = body;

        // Generate a simple ID from name if not provided (or use UUID in real app)
        const projectId = name.toLowerCase().replace(/[^a-z0-9]/g, "-");
        const timestamp = new Date().toISOString();

        // 1. Create Project Node
        await ProjectRepository.createProject({
            id: projectId,
            name,
            description,
            types: types || [],
            createdAt: timestamp
        });

        // 2. If domain is provided, create Site and link it
        if (domain) {
            // Ensure domain is a valid URL format for the ID or storage
            // For simplicity, we assume domain is like "example.com"
            // We might want to prepend https:// if missing for the URL field
            const url = domain.startsWith('http') ? domain : `https://${domain}`;
            const siteId = domain.replace(/[^a-zA-Z0-9]/g, "-");

            await SiteRepository.createOrUpdateSite({
                id: siteId,
                url: url,
                projectId: projectId // This might be redundant if we link explicitly, but good for reference
            });

            await ProjectRepository.linkSiteToProject(projectId, siteId);
        }

        return NextResponse.json({ message: "Project created", projectId });
    } catch (error) {
        console.error("Error creating project:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(request: Request) {
    // TODO: Fetch from Neo4j
    return NextResponse.json({ projects: [] });
}
