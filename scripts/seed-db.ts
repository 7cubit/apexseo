import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import neo4j from 'neo4j-driver';
import { createClient } from '@clickhouse/client';

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    dotenv.config();
}

// Config
const NEO4J_URI = process.env.NEO4J_URI || 'bolt://localhost:7687';
const NEO4J_USER = process.env.NEO4J_USER || 'neo4j';
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || 'password';
let CLICKHOUSE_HOST = process.env.CLICKHOUSE_HOST || 'http://localhost:8123';
if (CLICKHOUSE_HOST && !CLICKHOUSE_HOST.startsWith('http')) {
    CLICKHOUSE_HOST = `https://${CLICKHOUSE_HOST}`;
}
const CLICKHOUSE_USER = process.env.CLICKHOUSE_USER || 'default';
const CLICKHOUSE_PASSWORD = process.env.CLICKHOUSE_PASSWORD || '';

// Helpers for Random Data (Replacing Faker to avoid dependency issues)
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

const TOPICS = [
    { name: 'Technical SEO', clusters: ['Crawling', 'Indexing', 'Site Speed', 'Mobile Friendly'] },
    { name: 'Content Marketing', clusters: ['Blogging', 'Copywriting', 'Content Strategy', 'Link Building'] },
    { name: 'On-Page SEO', clusters: ['Meta Tags', 'Header Tags', 'Keyword Optimization', 'Internal Linking'] },
    { name: 'Off-Page SEO', clusters: ['Backlinks', 'Social Signals', 'Guest Posting', 'PR'] },
    { name: 'Local SEO', clusters: ['GMB', 'Citations', 'Reviews', 'Local Pack'] }
];

const KEYWORDS_BASE = ['seo', 'optimization', 'guide', 'tutorial', 'best practices', 'tools', 'audit', 'strategy', 'tips', 'checklist'];

async function main() {
    console.log('🌱 Starting Database Seed...');

    // 1. Connect to Neo4j
    const driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD));
    const neoSession = driver.session();

    // 2. Connect to ClickHouse
    const chClient = createClient({
        url: CLICKHOUSE_HOST,
        username: CLICKHOUSE_USER,
        password: CLICKHOUSE_PASSWORD,
        request_timeout: 90000,
    });

    try {
        console.log('🧹 Cleaning existing data...');
        // Neo4j Clean
        await neoSession.run('MATCH (n) DETACH DELETE n');
        // ClickHouse Clean (Truncate tables)
        await chClient.command({ query: 'TRUNCATE TABLE IF EXISTS projects' });
        await chClient.command({ query: 'TRUNCATE TABLE IF EXISTS pages' });
        await chClient.command({ query: 'TRUNCATE TABLE IF EXISTS rankings_daily' });
        await chClient.command({ query: 'TRUNCATE TABLE IF EXISTS traffic_daily' });
        console.log('✅ Data cleaned.');

        const projectId = 'project-1';
        const siteId = 'site-1';
        const userId = 'user-1';

        // 3. Seed Neo4j: Project & Site
        console.log('🏗️  Seeding Graph (Neo4j)...');
        await neoSession.run(`
            CREATE (u:User {id: $userId, email: 'demo@apexseo.com'})
            CREATE (p:Project {id: $projectId, name: 'ApexSEO Demo', created_at: datetime()})
            CREATE (s:Site {id: $siteId, domain: 'apexseo.com', baseUrl: 'https://apexseo.com'})
            MERGE (u)-[:OWNS]->(p)
            MERGE (p)-[:HAS_SITE]->(s)
        `, { userId, projectId, siteId });

        // 4. Seed Clusters & Pages
        const pages: any[] = [];
        const keywordData: any[] = [];

        for (const topic of TOPICS) {
            // Create Topic Node
            const topicId = generateId();
            await neoSession.run(`
                MATCH (s:Site {id: $siteId})
                CREATE (t:Topic {id: $topicId, name: $name})
                MERGE (s)-[:HAS_TOPIC]->(t)
            `, { siteId, topicId, name: topic.name });

            for (const clusterName of topic.clusters) {
                const clusterId = generateId();
                await neoSession.run(`
                    MATCH (t:Topic {id: $topicId})
                    CREATE (c:Cluster {id: $clusterId, name: $name})
                    MERGE (t)-[:HAS_CLUSTER]->(c)
                 `, { topicId, clusterId, name: clusterName });

                // Create 5-10 Pages per Cluster
                const pageCount = getRandomInt(5, 10);
                for (let i = 0; i < pageCount; i++) {
                    const pageId = generateId();
                    const keyword = `${clusterName.toLowerCase()} ${getRandomItem(KEYWORDS_BASE)}`;
                    const title = `${clusterName} ${getRandomItem(['Guide', 'Tutorial', 'Explained', 'Tips', 'Strategies'])}`;
                    const url = `https://apexseo.com/${clusterName.toLowerCase().replace(/ /g, '-')}/${keyword.replace(/ /g, '-')}`;

                    // Create Page & Keyword in Neo4j
                    await neoSession.run(`
                        MATCH (c:Cluster {id: $clusterId})
                        CREATE (p:Page {
                            id: $pageId,
                            url: $url,
                            title: $title,
                            status: 'PUBLISHED',
                            crawled_at: datetime(),
                            contentScore: $contentScore
                        })
                        CREATE (k:Keyword {id: $keywordId, text: $keyword})
                        MERGE (c)-[:HAS_PAGE]->(p)
                        MERGE (p)-[:TARGETS_KEYWORD]->(k)
                     `, {
                        clusterId,
                        pageId,
                        url,
                        title,
                        keywordId: generateId(),
                        keyword,
                        contentScore: getRandomInt(60, 100)
                    });

                    pages.push({ pageId, url, title, projectId: projectId, siteId: siteId });
                    keywordData.push({ keyword, pageId });
                }
            }
        }
        console.log(`✅ Graph seeded with ${pages.length} pages.`);

        // 5. Seed ClickHouse
        console.log('📊 Seeding Metrics (ClickHouse)...');

        // Projects
        await chClient.insert({
            table: 'projects',
            values: [{
                project_id: projectId,
                name: 'ApexSEO Demo',
                domain: 'apexseo.com',
                created_at: new Date().toISOString().replace('T', ' ').split('.')[0],
                user_id: userId
            }],
            format: 'JSONEachRow'
        });

        // Pages
        const pagesRows = pages.map(p => ({
            site_id: p.siteId,
            page_id: p.pageId,
            url: p.url,
            title: p.title,
            h1: p.title,
            content: 'Mock content...',
            word_count: getRandomInt(800, 2500),
            status: 'PUBLISHED',
            crawled_at: new Date().toISOString().replace('T', ' ').split('.')[0],
            content_score: getRandomInt(60, 100),
            is_orphan: 0,
            canonical_id: '',
            link_count_internal: getRandomInt(0, 20),
            link_count_external: getRandomInt(0, 5),
            keywords: []
        }));

        await chClient.insert({
            table: 'pages',
            values: pagesRows,
            format: 'JSONEachRow'
        });

        // Rankings Daily (30 days history)
        const rankingRows: any[] = [];
        const trafficRows: any[] = [];
        const now = new Date();

        for (let d = 30; d >= 0; d--) {
            const date = new Date(now);
            date.setDate(date.getDate() - d);
            const dateStr = date.toISOString().split('T')[0];

            // For each page/keyword
            pages.forEach((page, idx) => {
                // Mock Rank (fluctuate slightly)
                const baseRank = (idx % 20) + 1; // 1-20
                const fluctuation = getRandomInt(-2, 2);
                let rank = baseRank + fluctuation;
                if (rank < 1) rank = 1;

                // Mock Traffic
                const baseSessions = (100 - baseRank) * 2;
                const sessions = Math.max(0, baseSessions + getRandomInt(-10, 20));

                // Create conflicts: Reuse keyword keys for every 5th page to simulate cannibalization
                // We use the page index to determine the keyword_id.
                // If we want overlap, we map multiple pages to the same keyword_id.
                // e.g. pages[0] -> kw-0, pages[1] -> kw-0
                const conflictGroup = Math.floor(idx / 3); // Every 3 pages share a keyword? No, that's too much.
                // Let's make every 10th page conflict with the 11th.
                let keywordId = `kw-${idx}`;
                if (idx > 0 && idx % 10 === 0) {
                    keywordId = `kw-${idx - 1}`; // Conflict with previous
                }

                rankingRows.push({
                    date: dateStr,
                    project_id: projectId,
                    keyword_id: keywordId,
                    rank: rank,
                    url: page.url
                });

                trafficRows.push({
                    date: dateStr,
                    project_id: projectId,
                    page_id: page.pageId,
                    page_path: new URL(page.url).pathname,
                    sessions: sessions,
                    users: Math.floor(sessions * 0.8),
                    views: Math.floor(sessions * 1.5)
                });
            });
        }

        // Batch insert Rankings
        console.log(`Inserting ${rankingRows.length} ranking records...`);
        // Split into chunks if needed, but 30*50 = 1500 rows is fine
        await chClient.insert({
            table: 'rankings_daily',
            values: rankingRows,
            format: 'JSONEachRow'
        });

        // Batch insert Traffic
        console.log(`Inserting ${trafficRows.length} traffic records...`);
        await chClient.insert({
            table: 'traffic_daily',
            values: trafficRows,
            format: 'JSONEachRow'
        });

        console.log('✅ Metrics seeded.');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        await neoSession.close();
        await driver.close();
        await chClient.close();
    }
}

main().catch(console.error);
