import { driver, DATABASE } from '../driver';

export interface MarketContext {
    id: string;
    name: string;
    locale: {
        country: string;
        language: string;
    };
    competitors: Array<{
        domain: string;
        type: 'direct' | 'search';
    }>;
    seedKeywords: string[];
}

export interface GlobalBrandIdentity {
    name: string;
    logoUrl?: string;
    colors: { primary: string; secondary: string; accent: string };
    bannedWords: string[];
    boilerplate: string;
}

export interface ContentArchetype {
    id: string;
    name: string;
    voice: {
        tone: string;
        readingLevel: string;
        perspective: 'First Person (We)' | 'Third Person (It)';
    };
    targetAudience: string;
    structureTemplate?: string;
}

export interface KnowledgeGraph {
    products: Array<{
        id: string;
        name: string;
        description: string;
        features: string[];
    }>;
    usps: Array<{
        id: string;
        statement: string;
        evidence: string;
    }>;
    personnel: Array<{
        id: string;
        name: string;
        role: string;
        bio: string;
    }>;
}

export interface Project {
    id: string;
    name: string;
    siteId: string;
    createdAt: string;
    updatedAt: string;

    // V3 Fields
    settings: {
        crawlFrequency: 'Daily' | 'Weekly';
        trackCompetitors: boolean;
    };
    markets: MarketContext[];
    identity: GlobalBrandIdentity;
    archetypes: ContentArchetype[];
    knowledgeGraph: KnowledgeGraph;
}

export class ProjectRepository {
    static async createProject(project: Project) {
        if (!driver) return null;
        const session = driver.session({ database: DATABASE });
        try {
            await session.run(
                `
                MERGE (p:Project {id: $id})
                SET p.name = $name,
                    p.site_id = $siteId,
                    p.created_at = datetime($createdAt),
                    p.updated_at = datetime($updatedAt),
                    p.settings = $settings,
                    p.markets = $markets,
                    p.identity = $identity,
                    p.archetypes = $archetypes,
                    p.knowledge_graph = $knowledgeGraph
                RETURN p
                `,
                {
                    ...project,
                    settings: JSON.stringify(project.settings),
                    markets: JSON.stringify(project.markets),
                    identity: JSON.stringify(project.identity),
                    archetypes: JSON.stringify(project.archetypes),
                    knowledgeGraph: JSON.stringify(project.knowledgeGraph)
                }
            );

            // Link to Site
            await session.run(
                `
                MATCH (p:Project {id: $projectId})
                MATCH (s:Site {id: $siteId})
                MERGE (p)-[:MANAGES]->(s)
                `,
                { projectId: project.id, siteId: project.siteId }
            );

        } finally {
            await session.close();
        }
    }

    static async findProjectById(id: string): Promise<Project | null> {
        if (!driver) return null;
        const session = driver.session({ database: DATABASE });
        try {
            const result = await session.run(
                `MATCH (p:Project {id: $id}) RETURN p`,
                { id }
            );
            if (result.records.length === 0) return null;

            const props = result.records[0].get('p').properties;
            return {
                ...props,
                settings: props.settings ? JSON.parse(props.settings) : {},
                markets: props.markets ? JSON.parse(props.markets) : [],
                identity: props.identity ? JSON.parse(props.identity) : {},
                archetypes: props.archetypes ? JSON.parse(props.archetypes) : [],
                knowledgeGraph: props.knowledge_graph ? JSON.parse(props.knowledge_graph) : {},
                createdAt: props.created_at.toString(),
                updatedAt: props.updated_at.toString()
            };
        } finally {
            await session.close();
        }
    }

    static async findProjectBySiteId(siteId: string): Promise<Project | null> {
        if (!driver) return null;
        const session = driver.session({ database: DATABASE });
        try {
            const result = await session.run(
                `MATCH (p:Project)-[:MANAGES]->(s:Site {id: $siteId}) RETURN p`,
                { siteId }
            );
            if (result.records.length === 0) return null;
            const props = result.records[0].get('p').properties;
            return {
                ...props,
            }
        }
