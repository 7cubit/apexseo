import 'dotenv/config';
import { ClickHouseRankRepository, RankHistory } from '@/lib/clickhouse/repositories/ClickHouseRankRepository';
import { initClickHouse } from '@/lib/clickhouse';

async function seedData() {
    await initClickHouse();
    await ClickHouseRankRepository.createTable();

    const sites = [
        {
            id: 'example.com',
            keywords: [
                'seo tools', 'content optimization', 'internal linking', 'backlink checker', 'keyword research',
                'site audit', 'rank tracker', 'serp analysis', 'competitor analysis', 'seo reporting'
            ]
        },
        {
            id: 'junketjapan.com',
            keywords: [
                'japan travel guide', 'tokyo hotels', 'kyoto itinerary', 'osaka food', 'hokkaido skiing',
                'japan rail pass', 'mt fuji climbing', 'onsen etiquette', 'cherry blossom forecast', 'anime pilgrimage'
            ]
        }
    ];

    const days = 30;
    const now = new Date();

    for (const site of sites) {
        console.log(`Seeding data for ${site.id}...`);
        for (const keyword of site.keywords) {
            // Start with a random rank between 10 and 50
            let currentRank = Math.floor(Math.random() * 40) + 10;

            for (let i = days; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(date.getDate() - i);

                // Simulate daily change
                const change = Math.floor(Math.random() * 7) - 3; // -3 to +3
                let newRank = currentRank + change;

                // Ensure rank stays within 1-100
                if (newRank < 1) newRank = 1;
                if (newRank > 100) newRank = 100;

                // Occasional volatility (jump)
                if (Math.random() < 0.05) {
                    newRank += Math.floor(Math.random() * 10) - 5; // Bigger jump
                    if (newRank < 1) newRank = 1;
                    if (newRank > 100) newRank = 100;
                }

                const volatility = Math.abs(newRank - currentRank);
                const changeFromYesterday = i < days ? (currentRank - newRank) : 0; // Improvement is positive

                const record: RankHistory = {
                    site_id: site.id,
                    keyword: keyword,
                    rank_position: newRank,
                    url: `https://${site.id}/page-for-${keyword.replace(/\s+/g, '-')}`,
                    rank_date: date.toISOString().split('T')[0],
                    search_volume: Math.floor(Math.random() * 10000) + 100,
                    cpc: parseFloat((Math.random() * 5 + 0.5).toFixed(2)),
                    serp_features: [],
                    rank_volatility: volatility,
                    change_from_yesterday: changeFromYesterday
                };

                await ClickHouseRankRepository.insertRank(record);
                currentRank = newRank;
            }
        }
    }

    // Add Cannibalization Scenarios
    console.log("Seeding cannibalization scenarios...");

    // Scenario 1: example.com - "seo" on multiple pages
    const cannibal1 = {
        siteId: 'example.com',
        keyword: 'seo',
        urls: ['https://example.com/seo', 'https://example.com/seo-guide', 'https://example.com/seo-tools'],
        ranks: [15, 18, 22] // Mediocre ranks
    };

    for (let i = 0; i < cannibal1.urls.length; i++) {
        const url = cannibal1.urls[i];
        const rank = cannibal1.ranks[i];

        // Insert for last 7 days
        for (let d = 7; d >= 0; d--) {
            const date = new Date(now);
            date.setDate(date.getDate() - d);

            await ClickHouseRankRepository.insertRank({
                site_id: cannibal1.siteId,
                keyword: cannibal1.keyword,
                rank_position: rank + (Math.random() > 0.5 ? 1 : -1), // Slight fluctuation
                url: url,
                rank_date: date.toISOString().split('T')[0],
                search_volume: 50000,
                cpc: 2.5,
                serp_features: [],
                rank_volatility: 1,
                change_from_yesterday: 0
            });
        }
    }

    // Scenario 2: junketjapan.com - "tokyo hotels" on multiple pages
    const cannibal2 = {
        siteId: 'junketjapan.com',
        keyword: 'tokyo hotels',
        urls: ['https://junketjapan.com/tokyo', 'https://junketjapan.com/tokyo-hotels', 'https://junketjapan.com/accommodation/tokyo'],
        ranks: [5, 12, 25] // One good, others bad
    };

    for (let i = 0; i < cannibal2.urls.length; i++) {
        const url = cannibal2.urls[i];
        const rank = cannibal2.ranks[i];

        for (let d = 7; d >= 0; d--) {
            const date = new Date(now);
            date.setDate(date.getDate() - d);

            await ClickHouseRankRepository.insertRank({
                site_id: cannibal2.siteId,
                keyword: cannibal2.keyword,
                rank_position: rank,
                url: url,
                rank_date: date.toISOString().split('T')[0],
                search_volume: 12000,
                cpc: 1.8,
                serp_features: [],
                rank_volatility: 0,
                change_from_yesterday: 0
            });
        }
    }

    console.log('Seeding complete.');
}

seedData().catch(console.error);
