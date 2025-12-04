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
    static async listWithDetails(limit: number = 10, offset: number = 0, search?: string): Promise<any[]> {
        if (!driver) return [];
        const session = driver.session();
        try {
            let query = `MATCH (p:Project)`;
            const params: any = { limit: Number(limit), offset: Number(offset) };

            if (search) {
                query += ` WHERE toLower(p.name) CONTAINS toLower($search) OR toLower(p.domain) CONTAINS toLower($search)`;
                params.search = search;
            }

            query += `
                OPTIONAL MATCH (p)<-[:OWNS_PROJECT]-(u:User)
                OPTIONAL MATCH (u)-[:BELONGS_TO]->(a:Account)
                OPTIONAL MATCH (a)-[:HAS_SUBSCRIPTION]->(s:Subscription)-[:IS_ON_PLAN]->(pl:Plan)
                WHERE s.status = 'ACTIVE'
                RETURN p, u, a, pl
                ORDER BY p.createdAt DESC
                SKIP $offset
                LIMIT $limit
            `;

            const result = await session.run(query, params);
            return result.records.map(record => ({
                ...record.get('p').properties,
                owner: record.get('u')?.properties,
                account: record.get('a')?.properties,
                plan: record.get('pl')?.properties
            }));
        } finally {
            await session.close();
        }
    }

    static async updateStatus(id: string, status: string): Promise<void> {
        if (!driver) return;
        const session = driver.session();
        try {
            await session.run(
                `
                MATCH (p:Project {id: $id})
                SET p.crawlStatus = $status, p.updatedAt = datetime()
                `,
                { id, status }
            );
        } finally {
            await session.close();
        }
    }
}
