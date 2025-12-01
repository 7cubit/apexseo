import 'dotenv/config';
import { ClickHouseBacklinkRepository } from '../lib/clickhouse/repositories/ClickHouseBacklinkRepository';

async function seedBacklinks() {
    console.log("Initializing Backlinks Table...");
    await ClickHouseBacklinkRepository.createTable();

    // Example.com: 247 domains, 1247 backlinks
    console.log("Seeding backlinks for example.com...");
    await generateBacklinks('example.com', 247, 1247);

    // JunketJapan.com: 87 domains, 342 backlinks
    console.log("Seeding backlinks for junketjapan.com...");
    await generateBacklinks('junketjapan.com', 87, 342);

    console.log("Seeding complete.");
}

async function generateBacklinks(siteId: string, domainCount: number, linkCount: number) {
    const domains = [];
    for (let i = 0; i < domainCount; i++) {
        domains.push({
            domain: `domain${i}.com`,
            spam_score: Math.random() * 100 > 90 ? Math.random() * 70 + 30 : Math.random() * 10, // 10% toxic
            relevance: Math.random()
        });
    }

    const links = [];
    for (let i = 0; i < linkCount; i++) {
        const source = domains[Math.floor(Math.random() * domains.length)];
        const isDofollow = Math.random() > 0.3; // 70% dofollow

        links.push({
            site_id: siteId,
            referring_domain: source.domain,
            backlink_url: `https://${source.domain}/page-${Math.floor(Math.random() * 100)}`,
            target_url: `https://${siteId}/page-${Math.floor(Math.random() * 20)}`,
            anchor_text: ['seo tools', 'read more', 'click here', 'best seo', 'link'][Math.floor(Math.random() * 5)],
            is_dofollow: isDofollow,
            spam_score: source.spam_score,
            date_found: new Date(Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
            domain_relevance: source.relevance
        });

        // Batch insert every 500
        if (links.length >= 500) {
            await ClickHouseBacklinkRepository.insertBacklinks(links);
            links.length = 0;
        }
    }

    if (links.length > 0) {
        await ClickHouseBacklinkRepository.insertBacklinks(links);
    }
}

seedBacklinks().catch(console.error);
