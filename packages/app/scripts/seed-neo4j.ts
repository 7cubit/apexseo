import 'dotenv/config';
import { driver } from '../src/lib/neo4j/driver';
import { v4 as uuidv4 } from 'uuid';

const PROJECT_ID = 'project-1';
const PROJECT_NAME = 'ApexSEO Space';
const DOMAIN = 'apexseo.com';

async function seedNeo4j() {
    if (!driver) {
        console.error('❌ Neo4j driver not initialized. Check environment variables.');
        return;
    }
    const session = driver.session();
    try {
        console.log('🌱 Starting Neo4j Seeding...');

        // 1. Create Project
        await session.run(`
            MERGE (p:Project {id: $id})
            SET p.name = $name, p.domain = $domain, p.createdAt = datetime()
        `, { id: PROJECT_ID, name: PROJECT_NAME, domain: DOMAIN });
        console.log('✅ Project Created');

        // 2. Create Topic Clusters (Topical Map)
        const clusters = [
            { name: 'Technical SEO', keywords: ['site speed', 'core web vitals', 'schema markup'] },
            { name: 'Content Strategy', keywords: ['keyword research', 'content calendar', 'topic clusters'] },
            { name: 'Link Building', keywords: ['guest posting', 'broken link building', 'digital pr'] },
            { name: 'Local SEO', keywords: ['google business profile', 'local citations', 'nap consistency'] }
        ];

        for (const cluster of clusters) {
            const clusterId = uuidv4();
            await session.run(`
                MATCH (p:Project {id: $projectId})
                MERGE (c:Cluster {name: $name})
                SET c.id = $id, c.status = 'active'
                MERGE (p)-[:HAS_CLUSTER]->(c)
                
                WITH c
                UNWIND $keywords as kw
                MERGE (k:Keyword {text: kw})
                MERGE (c)-[:TARGETS]->(k)
            `, { projectId: PROJECT_ID, name: cluster.name, id: clusterId, keywords: cluster.keywords });
        }
        console.log('✅ Topic Clusters Created');

        // 3. Create Pages (Content Inventory)
        const pages = [
            { title: 'Ultimate Guide to Technical SEO', url: '/blog/technical-seo-guide', cluster: 'Technical SEO', status: 'PUBLISHED', score: 92 },
            { title: 'How to Improve Core Web Vitals', url: '/blog/core-web-vitals', cluster: 'Technical SEO', status: 'PUBLISHED', score: 85 },
            { title: 'Schema Markup for Beginners', url: '/blog/schema-markup', cluster: 'Technical SEO', status: 'DRAFT', score: 45 },
            { title: 'Content Strategy Template 2024', url: '/resources/content-strategy-template', cluster: 'Content Strategy', status: 'PUBLISHED', score: 78 },
            { title: 'Link Building Tactics That Work', url: '/blog/link-building-tactics', cluster: 'Link Building', status: 'PUBLISHED', score: 88 },
            { title: 'Local SEO Checklist', url: '/blog/local-seo-checklist', cluster: 'Local SEO', status: 'PUBLISHED', score: 95 }
        ];

        for (const page of pages) {
            await session.run(`
                MATCH (c:Cluster {name: $clusterName})
                MERGE (p:Page {url: $url})
                SET p.id = $id, 
                    p.title = $title, 
                    p.status = $status, 
                    p.contentScore = $score,
                    p.lastUpdated = datetime()
                MERGE (p)-[:BELONGS_TO]->(c)
            `, {
                clusterName: page.cluster,
                url: page.url,
                id: uuidv4(),
                title: page.title,
                status: page.status,
                score: page.score
            });
        }
        console.log('✅ Pages Created');

        // 4. Create Internal Links (Mock)
        await session.run(`
            MATCH (p1:Page {url: '/blog/technical-seo-guide'})
            MATCH (p2:Page {url: '/blog/core-web-vitals'})
            MERGE (p1)-[:LINKS_TO]->(p2)
        `);
        console.log('✅ Internal Links Created');

        console.log('🎉 Neo4j Seeding Complete!');

    } catch (error) {
        console.error('❌ Seeding Failed:', error);
    } finally {
        await session.close();
        await driver.close();
    }
}

seedNeo4j();
