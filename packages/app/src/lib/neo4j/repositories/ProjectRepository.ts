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
        perspective: 'First Person (We)' | 'Third Person (It)' | 'Second Person (You)';
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

export interface BrandVoiceDNA {
    toneProfile: {
        formal: number;
        technical: number;
        serious: number;
        dataDriven: number;
    };
    vocabularyFingerprint: string[];
    structuralPreferences: {
        avgH2Count: number;
        listUsage: 'low' | 'medium' | 'high';
    };
    bannedPhrases: string[];
}

export interface ContentPillar {
    id: string;
    topic: string;
    subtopics: string[];
    targetKeywords: string[];
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
    brandVoiceDNA?: BrandVoiceDNA; // New Field
    contentPillars?: ContentPillar[]; // New Field
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
                    p.brand_voice_dna = $brandVoiceDNA,
                    p.content_pillars = $contentPillars,
                    p.archetypes = $archetypes,
                    p.knowledge_graph = $knowledgeGraph
                RETURN p
                `,
                {
                    ...project,
                    settings: JSON.stringify(project.settings),
                    markets: JSON.stringify(project.markets),
                    identity: JSON.stringify(project.identity),
                    brandVoiceDNA: project.brandVoiceDNA ? JSON.stringify(project.brandVoiceDNA) : null,
                    contentPillars: project.contentPillars ? JSON.stringify(project.contentPillars) : null,
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

    static async getAllProjects(): Promise<Project[]> {
        // Mock Data for Fallback
        const mockProjects: Project[] = [
            {
                id: 'example-project-id',
                name: 'Example Project',
                siteId: 'example-site-id',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                settings: { crawlFrequency: 'Weekly', trackCompetitors: false },
                markets: [{ id: 'm1', name: 'US Market', locale: { country: 'US', language: 'en' }, competitors: [], seedKeywords: ['example'] }],
                identity: { name: 'Example Brand', colors: { primary: '#000000', secondary: '#ffffff', accent: '#3b82f6' }, bannedWords: [], boilerplate: 'Example boilerplate.' },
                archetypes: [{ id: 'a1', name: 'General', voice: { tone: 'Neutral', readingLevel: 'General', perspective: 'Third Person (It)' }, targetAudience: 'Everyone' }],
                knowledgeGraph: { products: [], usps: [], personnel: [] }
            },
            {
                id: 'apexseo-project-id',
                name: 'ApexSEO',
                siteId: 'apexseo-site-id',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                settings: { crawlFrequency: 'Daily', trackCompetitors: true },
                markets: [{ id: 'm2', name: 'US Market', locale: { country: 'US', language: 'en' }, competitors: [{ domain: 'ahrefs.com', type: 'direct' }], seedKeywords: ['seo'] }],
                identity: { name: 'ApexSEO', colors: { primary: '#0f172a', secondary: '#ffffff', accent: '#3b82f6' }, bannedWords: [], boilerplate: 'ApexSEO is an enterprise SEO platform.' },
                archetypes: [{ id: 'a2', name: 'Blog', voice: { tone: 'Authoritative', readingLevel: 'University', perspective: 'First Person (We)' }, targetAudience: 'SEO Pros' }],
                knowledgeGraph: { products: [], usps: [], personnel: [] }
            }
        ];

        if (!driver) return mockProjects;

        const session = driver.session({ database: DATABASE });
        try {
            const result = await session.run(`MATCH (p:Project) RETURN p`);
            if (result.records.length === 0) return mockProjects;

            return result.records.map(record => {
                const props = record.get('p').properties;
                return {
                    ...props,
                    settings: props.settings ? JSON.parse(props.settings) : {},
                    markets: props.markets ? JSON.parse(props.markets) : [],
                    identity: props.identity ? JSON.parse(props.identity) : {},
                    brandVoiceDNA: props.brand_voice_dna ? JSON.parse(props.brand_voice_dna) : undefined,
                    contentPillars: props.content_pillars ? JSON.parse(props.content_pillars) : [],
                    archetypes: props.archetypes ? JSON.parse(props.archetypes) : [],
                    knowledgeGraph: props.knowledge_graph ? JSON.parse(props.knowledge_graph) : {},
                    createdAt: props.created_at.toString(),
                    updatedAt: props.updated_at.toString()
                };
            });
        } catch (error) {
            console.warn("Failed to fetch projects from Neo4j, returning mocks.", error);
            return mockProjects;
        } finally {
            await session.close();
        }
    }

    static async findProjectById(id: string): Promise<Project | null> {
        // Mock Fallback
        if (id === 'example-project-id' || id === 'apexseo-project-id') {
            const all = await this.getAllProjects();
            return all.find(p => p.id === id) || null;
        }

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
                brandVoiceDNA: props.brand_voice_dna ? JSON.parse(props.brand_voice_dna) : undefined,
                contentPillars: props.content_pillars ? JSON.parse(props.content_pillars) : [],
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
        // Mock Fallback
        if (siteId === 'example-site-id' || siteId === 'apexseo-site-id') {
            const all = await this.getAllProjects();
            return all.find(p => p.siteId === siteId) || null;
        }

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
                settings: props.settings ? JSON.parse(props.settings) : {},
                markets: props.markets ? JSON.parse(props.markets) : [],
                identity: props.identity ? JSON.parse(props.identity) : {},
                brandVoiceDNA: props.brand_voice_dna ? JSON.parse(props.brand_voice_dna) : undefined,
                contentPillars: props.content_pillars ? JSON.parse(props.content_pillars) : [],
                archetypes: props.archetypes ? JSON.parse(props.archetypes) : [],
                knowledgeGraph: props.knowledge_graph ? JSON.parse(props.knowledge_graph) : {},
                createdAt: props.created_at.toString(),
                updatedAt: props.updated_at.toString()
            };
        } finally {
            await session.close();
        }
    }

    static async getPublishedContent(projectId: string): Promise<PublishedPost[]> {
        if (!driver) return [];
        const session = driver.session({ database: DATABASE });
        try {
            const result = await session.run(
                `
                MATCH (p:Project {id: $projectId})-[:MANAGES]->(s:Site)-[:HAS_PAGE]->(page:Page)
                WHERE page.status = 'published' OR page.status IS NULL // Assume published if not specified
                RETURN page.id as id, page.title as title, page.url as url, page.content as content, page.target_keyword as targetKeyword
                LIMIT 100
                `,
                { projectId }
            );

            return result.records.map(record => ({
                id: record.get('id'),
                title: record.get('title'),
                url: record.get('url'),
                content: record.get('content') || '', // Content might be large or missing
                targetKeyword: record.get('targetKeyword')
            }));
        } catch (error) {
            console.error("Failed to fetch published content", error);
            return [];
        } finally {
            await session.close();
        }
    }
}

export interface PublishedPost {
    id: string;
    title: string;
    url: string;
    content: string;
    targetKeyword?: string;
}
