import 'dotenv/config';
import { driver, DATABASE } from '../src/lib/neo4j/driver';
import { ProjectRepository, Project } from '../src/lib/neo4j/repositories/ProjectRepository';
import { SiteRepository } from '../src/lib/neo4j/repositories/SiteRepository';

// Simple UUID generator
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

async function seed() {
    console.log('🌱 Seeding Projects...');

    // 1. Example Project
    const exampleSiteId = generateUUID();
    const exampleProjectId = generateUUID();

    console.log(`Creating Site: example.com (${exampleSiteId})`);
    await SiteRepository.createOrUpdateSite({
        id: exampleSiteId,
        url: 'https://example.com',
        projectId: exampleProjectId,
        lastCrawled: new Date().toISOString()
    });

    const exampleProject: Project = {
        id: exampleProjectId,
        name: 'Example Project',
        siteId: exampleSiteId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        settings: { crawlFrequency: 'Weekly', trackCompetitors: false },
        markets: [
            {
                id: generateUUID(),
                name: 'US Market',
                locale: { country: 'US', language: 'en' },
                competitors: [],
                seedKeywords: ['example', 'test']
            }
        ],
        identity: {
            name: 'Example Brand',
            colors: { primary: '#000000', secondary: '#ffffff', accent: '#3b82f6' },
            bannedWords: [],
            boilerplate: 'This is an example project.'
        },
        archetypes: [
            {
                id: generateUUID(),
                name: 'General',
                voice: { tone: 'Neutral', readingLevel: 'General', perspective: 'Third Person (It)' },
                targetAudience: 'Everyone'
            }
        ],
        knowledgeGraph: { products: [], usps: [], personnel: [] }
    };

    console.log(`Creating Project: Example Project (${exampleProjectId})`);
    await ProjectRepository.createProject(exampleProject);


    // 2. ApexSEO Project
    const apexSiteId = generateUUID();
    const apexProjectId = generateUUID();

    console.log(`Creating Site: apexseo.co (${apexSiteId})`);
    await SiteRepository.createOrUpdateSite({
        id: apexSiteId,
        url: 'https://apexseo.co',
        projectId: apexProjectId,
        lastCrawled: new Date().toISOString()
    });

    const apexProject: Project = {
        id: apexProjectId,
        name: 'ApexSEO',
        siteId: apexSiteId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        settings: { crawlFrequency: 'Daily', trackCompetitors: true },
        markets: [
            {
                id: generateUUID(),
                name: 'US Market',
                locale: { country: 'US', language: 'en' },
                competitors: [
                    { domain: 'ahrefs.com', type: 'direct' },
                    { domain: 'semrush.com', type: 'direct' },
                    { domain: 'jasper.ai', type: 'search' }
                ],
                seedKeywords: ['seo platform', 'ai seo', 'enterprise seo', 'neo4j seo']
            }
        ],
        identity: {
            name: 'ApexSEO',
            logoUrl: 'https://apexseo.co/logo.png',
            colors: { primary: '#0f172a', secondary: '#ffffff', accent: '#3b82f6' },
            bannedWords: ['cheap', 'guarantee', 'instant'],
            boilerplate: 'ApexSEO is the enterprise-grade SEO platform powered by Neo4j and AI agents. We help large organizations dominate search with structured data and autonomous workflows.'
        },
        archetypes: [
            {
                id: generateUUID(),
                name: 'Educational Blog',
                voice: { tone: 'Authoritative & Helpful', readingLevel: 'University', perspective: 'First Person (We)' },
                targetAudience: 'SEO Managers, CMOs, Technical Marketers'
            },
            {
                id: generateUUID(),
                name: 'Feature Page',
                voice: { tone: 'Persuasive & Benefit-Driven', readingLevel: 'High School', perspective: 'Second Person (You)' },
                targetAudience: 'Decision Makers'
            }
        ],
        knowledgeGraph: {
            products: [
                { id: generateUUID(), name: 'Site Doctor', description: 'Automated technical SEO auditing agent.', features: ['Crawl Analysis', 'Core Web Vitals', 'JS Rendering'] },
                { id: generateUUID(), name: 'Content Studio', description: 'AI-powered content generation and optimization.', features: ['Topic Clustering', 'E-E-A-T Scoring', 'Auto-Drafting'] },
                { id: generateUUID(), name: 'Rank Tracker', description: 'Enterprise-grade rank tracking with volatility alerts.', features: ['Daily Updates', 'Cannibalization Detection', 'Local SEO'] }
            ],
            usps: [
                { id: generateUUID(), statement: 'Knowledge Graph SEO', evidence: 'We use Neo4j to model your entire site structure, not just flat pages.' },
                { id: generateUUID(), statement: 'Agentic Workflows', evidence: 'Our AI agents perform complex tasks like internal linking and content updates autonomously.' }
            ],
            personnel: [
                { id: generateUUID(), name: 'David B.', role: 'Founder', bio: 'SEO veteran and full-stack engineer.' }
            ]
        }
    };

    console.log(`Creating Project: ApexSEO (${apexProjectId})`);
    await ProjectRepository.createProject(apexProject);

    console.log('✅ Seeding Complete!');
    await driver.close();
}

seed().catch(console.error);
