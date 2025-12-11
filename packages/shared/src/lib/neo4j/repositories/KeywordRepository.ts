import { driver, DATABASE } from '../driver';

export interface Keyword {
    id: string; // usually the keyword text itself
    term: string;
    projectId: string;
    volume?: number;
    difficulty?: number;
    status: 'discovered' | 'selected' | 'brief_ready' | 'drafting' | 'published';
    createdAt: string;
}

export class KeywordRepository {
    static async addKeywordsToProject(projectId: string, keywords: string[]) {
        if (!driver) return;
        const session = driver.session({ database: DATABASE });
        try {
            await session.run(
                `
                MATCH (p:Project {id: $projectId})
                UNWIND $keywords as term
                MERGE (k:Keyword {id: term, term: term, projectId: $projectId})
                ON CREATE SET k.status = 'discovered', k.createdAt = datetime()
                MERGE (p)-[:TARGETS_KEYWORD]->(k)
                `,
                { projectId, keywords }
            );
        } finally {
            await session.close();
        }
    }

    static async updateKeywordStatus(term: string, projectId: string, status: string) {
        if (!driver) return;
        const session = driver.session({ database: DATABASE });
        try {
            await session.run(
                `
                MATCH (k:Keyword {term: $term, projectId: $projectId})
                SET k.status = $status, k.updatedAt = datetime()
                `,
                { term, projectId, status }
            );
        } finally {
            await session.close();
        }
    }

    static async getProjectKeywords(projectId: string) {
        if (!driver) return [];
        const session = driver.session({ database: DATABASE });
        try {
            const result = await session.run(
                `
                MATCH (p:Project {id: $projectId})-[:TARGETS_KEYWORD]->(k:Keyword)
                RETURN k
                ORDER BY k.createdAt DESC
                `,
                { projectId }
            );
            return result.records.map(r => r.get('k').properties);
        } finally {
            await session.close();
        }
    }
}
