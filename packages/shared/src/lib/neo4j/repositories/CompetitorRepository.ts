import { driver, DATABASE } from '../driver';

export interface Competitor {
    domain: string;
    projectId: string;
    createdAt: string;
}

export class CompetitorRepository {
    static async addCompetitorsToProject(projectId: string, domains: string[]) {
        if (!driver) return;
        const session = driver.session({ database: DATABASE });
        try {
            await session.run(
                `
                MATCH (p:Project {id: $projectId})
                UNWIND $domains as domain
                MERGE (c:Competitor {domain: domain, projectId: $projectId})
                ON CREATE SET c.createdAt = datetime()
                MERGE (p)-[:COMPETES_WITH]->(c)
                `,
                { projectId, domains }
            );
        } finally {
            await session.close();
        }
    }

    static async getProjectCompetitors(projectId: string) {
        if (!driver) return [];
        const session = driver.session({ database: DATABASE });
        try {
            const result = await session.run(
                `
                MATCH (p:Project {id: $projectId})-[:COMPETES_WITH]->(c:Competitor)
                RETURN c
                ORDER BY c.createdAt DESC
                `,
                { projectId }
            );
            return result.records.map(r => r.get('c').properties);
        } finally {
            await session.close();
        }
    }
}
