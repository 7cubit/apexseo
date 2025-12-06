import 'dotenv/config';
import { client } from '../src/lib/clickhouse';

async function seedClickHouse() {
    if (!client) {
        console.error('❌ ClickHouse client not initialized. Check environment variables.');
        process.exit(1);
    }

    try {
        console.log('🌱 Starting ClickHouse Seeding...');

        // 1. Create Tables
        await client.command({
            query: `
            CREATE TABLE IF NOT EXISTS rankings_daily (
                date Date,
                keyword String,
                url String,
                rank UInt8,
                volume UInt32
            ) ENGINE = MergeTree()
            ORDER BY (date, keyword, url)
            `
        });

        await client.command({
            query: `
            CREATE TABLE IF NOT EXISTS traffic_daily (
                date Date,
                url String,
                visits UInt32,
                source String
            ) ENGINE = MergeTree()
            ORDER BY (date, url)
            `
        });
        console.log('✅ Tables Created');

        // 2. Generate Mock Data (Last 30 Days)
        const pages = [
            '/blog/technical-seo-guide',
            '/blog/core-web-vitals',
            '/blog/schema-markup',
            '/resources/content-strategy-template',
            '/blog/link-building-tactics',
            '/blog/local-seo-checklist'
        ];

        const keywords = [
            'technical seo guide',
            'core web vitals',
            'schema markup',
            'content strategy',
            'link building',
            'local seo'
        ];

        const rankingsData: any[] = [];
        const trafficData: any[] = [];

        const today = new Date();
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            // Rankings
            pages.forEach((url, idx) => {
                const keyword = keywords[idx];
                // Simulate some volatility
                const baseRank = (idx * 3) + 1;
                const volatility = Math.floor(Math.random() * 5) - 2;
                const rank = Math.max(1, baseRank + volatility);

                rankingsData.push({
                    date: dateStr,
                    keyword,
                    url,
                    rank,
                    volume: 1000 + (idx * 500)
                });
            });

            // Traffic
            pages.forEach(url => {
                const visits = Math.floor(Math.random() * 500) + 100;
                trafficData.push({
                    date: dateStr,
                    url,
                    visits,
                    source: 'organic'
                });
            });
        }

        // 3. Insert Data
        await client.insert({
            table: 'rankings_daily',
            values: rankingsData,
            format: 'JSONEachRow'
        });
        console.log(`✅ Inserted ${rankingsData.length} ranking records`);

        await client.insert({
            table: 'traffic_daily',
            values: trafficData,
            format: 'JSONEachRow'
        });
        console.log(`✅ Inserted ${trafficData.length} traffic records`);

        console.log('🎉 ClickHouse Seeding Complete!');

    } catch (error) {
        console.error('❌ Seeding Failed:', error);
    } finally {
        await client.close();
    }
}

seedClickHouse();
