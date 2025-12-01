import { driver } from "../driver";

export interface ProjectData {
    id: string;
    name: string;
    description?: string;
    types: string[];
    createdAt: string;
}

export class ProjectRepository {
    static async createProject(data: ProjectData) {
        if (!driver) return;
        const session = driver.session();
        try {
            await session.run(
                `
                MERGE (p:Project {id: $id})
                SET p.name = $name,
                    p.description = $description,
                    p.types = $types,
                    p.createdAt = $createdAt,
                    p.updatedAt = $createdAt
                RETURN p
                `,
                data
            );
        } finally {
            await session.close();
        }
    }

    static async linkSiteToProject(projectId: string, siteId: string) {
        if (!driver) return;
        const session = driver.session();
        try {
            await session.run(
                `
                MATCH (p:Project {id: $projectId})
                MATCH (s:Site {id: $siteId})
                MERGE (p)-[:HAS_SITE]->(s)
                `
                , { projectId, siteId }
            );
        } finally {
            await session.close();
        }
    }
}
