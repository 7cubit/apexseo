import 'dotenv/config';
import 'dotenv/config';
import {
    ClickHousePageRepository,
    ClickHouseBacklinkRepository,
    ClickHouseHealthScoreRepository,
    ClickHouseUxSessionStore,
    ClickHouseCrawlLogRepository,
    HealthScoreService,
    client
} from '@apexseo/shared';
import { v4 as uuidv4 } from 'uuid';

async function seedHealthData() {
    console.log("Initializing Tables...");
    await ClickHouseHealthScoreRepository.createTable();
    await ClickHousePageRepository.createTable();
    await ClickHouseCrawlLogRepository.createTable();
    await ClickHouseUxSessionStore.initialize();
    // Ensure other tables exist (assuming they do from previous steps, but good to be safe if this was standalone)

    const siteId = 'junketjapan.com';
    console.log(`Seeding data for ${siteId}...`);

    // 1. Seed Pages with various metrics
    const pages = [];
    for (let i = 0; i < 50; i++) {
        pages.push({
            site_id: siteId,
            page_id: uuidv4(),
            url: `https://${siteId}/page-${i}`,
            title: `Page ${i}`,
            tspr: Math.random(), // 0-1
            content_score: Math.floor(Math.random() * 100), // 0-100
            max_claim_risk: Math.floor(Math.random() * 100), // 0-100 (Risk)
            // Other fields optional/default
        });
    }

    // Insert pages (using a loop or batch if repo supports it, repo supports single insert currently)
    // We'll just insert one by one for this seed script or update repo to support batch.
    // Checking repo... createPage takes single page.
    // For speed, let's just insert them.
    // Insert pages
    for (const page of pages) {
        await ClickHousePageRepository.createPage(page);

        // Also insert into raw_crawl_log for replay testing
        // Mock HTML with links
        const html = `
            <html>
                <head>
                    <title>${page.title}</title>
                    <link rel="canonical" href="${page.url}" />
                </head>
                <body>
                    <h1>${page.title}</h1>
                    <p>Some content...</p>
                    <!-- Internal Link -->
                    <a href="https://${siteId}/page-${Math.floor(Math.random() * 50)}">Internal Link</a>
                    <!-- External Link -->
                    <a href="https://external.com">External Link</a>
                </body>
            </html>
        `;

        await ClickHouseCrawlLogRepository.insertLog({
            url: page.url,
            html,
            timestamp: Date.now(),
            status: 200
        });
    }
    console.log(`Inserted ${pages.length} pages and crawl logs.`);

    // 2. Seed Backlinks (some pages get good links, some bad, some none)
    const backlinks = [];
    for (const page of pages) {
        const numLinks = Math.floor(Math.random() * 20);
        for (let j = 0; j < numLinks; j++) {
            backlinks.push({
                site_id: siteId,
                referring_domain: `domain-${Math.floor(Math.random() * 1000)}.com`,
                backlink_url: `https://external.com/link-${j}`,
                target_url: page.url,
                anchor_text: 'link',
                is_dofollow: Math.random() > 0.5,
                spam_score: Math.random() * 100,
                date_found: new Date().toISOString().split('T')[0],
                domain_relevance: Math.random() // 0-1
            });
        }
    }
    await ClickHouseBacklinkRepository.insertBacklinks(backlinks);
    console.log(`Inserted ${backlinks.length} backlinks.`);

    // 3. Calculate Health Scores
    console.log("Waiting for data to be indexed...");
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Debug: Check count
    if (client) {
        const countResult = await client.query({
            query: 'SELECT count() as count FROM pages',
            format: 'JSONEachRow'
        });
        const count = await countResult.json();
        console.log("Total pages in DB:", count);
    }

    console.log("Calculating health scores...");
    const scores = await HealthScoreService.calculateAndSave(siteId);
    console.log(`Calculated ${scores.length} health scores.`);

    // 4. Generate History (fake past data)
    console.log("Generating history...");
    const historyScores = [];
    for (let d = 1; d <= 30; d++) {
        const date = new Date();
        date.setDate(date.getDate() - d);
        const dateStr = date.toISOString().split('T')[0];

        // Create a slight trend
        const trendFactor = 1 - (d * 0.005); // Scores were slightly lower in the past

        for (const score of scores) {
            historyScores.push({
                ...score,
                health_score: Math.max(0, Math.min(100, score.health_score * trendFactor + (Math.random() * 5 - 2.5))),
                score_date: dateStr
            });
        }
    }
    await ClickHouseHealthScoreRepository.saveScores(historyScores);
    console.log("History generated.");

    console.log("Seeding complete.");
}

seedHealthData().catch(console.error);
