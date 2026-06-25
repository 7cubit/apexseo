/**
 * Comprehensive Seed Script for ApexSEO
 * Populates ClickHouse and PostgreSQL with realistic sample data
 * 
 * Usage:
 *   npm run seed:dev
 */

import { ClickHouseClient, createClient } from '@clickhouse/client';
import { v4 as uuidv4 } from 'uuid';

const clickhouse = createClient({
    host: process.env.CLICKHOUSE_HOST || 'http://localhost:8123',
    username: process.env.CLICKHOUSE_USER || 'default',
    password: process.env.CLICKHOUSE_PASSWORD || '',
    database: process.env.CLICKHOUSE_DB || 'apexseo',
});

// Sample data generators
const sampleDomains = [
    'techstartup.com',
    'healthblog.io',
    'ecommerce-store.com',
    'saas-platform.app',
    'marketing-agency.co',
];

const sampleKeywords = [
    'seo optimization',
    'content marketing',
    'keyword research',
    'link building',
    'technical seo',
    'on-page seo',
    'backlink analysis',
    'serp tracking',
    'google analytics',
    'conversion rate optimization',
];

const samplePages = [
    { path: '/blog/seo-guide', title: 'Complete SEO Guide 2024', h1: 'The Ultimate SEO Guide' },
    { path: '/services/seo', title: 'SEO Services | Expert Optimization', h1: 'Professional SEO Services' },
    { path: '/blog/content-marketing', title: 'Content Marketing Strategy', h1: 'How to Build a Content Strategy' },
    { path: '/resources/tools', title: 'Best SEO Tools', h1: 'Top 10 SEO Tools in 2024' },
    { path: '/case-studies/client-success', title: 'Client Success Story', h1: 'How We Increased Traffic by 300%' },
];

function generateRandomContent(wordCount: number): string {
    const words = [
        'SEO', 'optimization', 'content', 'keywords', 'ranking', 'traffic', 'backlinks',
        'analytics', 'strategy', 'marketing', 'search', 'engine', 'Google', 'website',
        'performance', 'conversion', 'engagement', 'audience', 'organic', 'visibility',
    ];

    return Array.from({ length: wordCount }, () =>
        words[Math.floor(Math.random() * words.length)]
    ).join(' ');
}

function randomDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function seedProjects() {
    console.log('🌱 Seeding projects...');

    const projects = sampleDomains.map(domain => ({
        project_id: uuidv4(),
        name: domain.split('.')[0].replace(/-/g, ' ').toUpperCase(),
        domain,
        created_at: randomDate(new Date(2023, 0, 1), new Date()),
        user_id: uuidv4(),
    }));

    await clickhouse.insert({
        table: 'projects',
        values: projects,
        format: 'JSONEachRow',
    });

    console.log(`✅ Seeded ${projects.length} projects`);
    return projects;
}

async function seedPages(projects: any[]) {
    console.log('🌱 Seeding pages...');

    const pages = [];
    for (const project of projects) {
        for (const page of samplePages) {
            const wordCount = Math.floor(Math.random() * 2000) + 500;
            pages.push({
                site_id: project.project_id,
                page_id: uuidv4(),
                url: `https://${project.domain}${page.path}`,
                title: page.title,
                h1: page.h1,
                content: generateRandomContent(wordCount),
                word_count: wordCount,
                status: Math.random() > 0.2 ? 'published' : 'draft',
                crawled_at: randomDate(new Date(2024, 0, 1), new Date()),
                content_score: Math.random() * 100,
                is_orphan: Math.random() > 0.9 ? 1 : 0,
                canonical_id: uuidv4(),
                link_count_internal: Math.floor(Math.random() * 50),
                link_count_external: Math.floor(Math.random() * 20),
                keywords: sampleKeywords.slice(0, Math.floor(Math.random() * 5) + 1),
            });
        }
    }

    await clickhouse.insert({
        table: 'pages',
        values: pages,
        format: 'JSONEachRow',
    });

    console.log(`✅ Seeded ${pages.length} pages`);
    return pages;
}

async function seedKeywordMetrics() {
    console.log('🌱 Seeding keyword metrics...');

    const keywords = sampleKeywords.map(keyword => ({
        keyword_id: uuidv4(),
        text: keyword,
        search_volume: Math.floor(Math.random() * 50000) + 1000,
        difficulty: Math.floor(Math.random() * 100),
        cpc: parseFloat((Math.random() * 10).toFixed(2)),
        updated_at: new Date(),
    }));

    await clickhouse.insert({
        table: 'keyword_metrics',
        values: keywords,
        format: 'JSONEachRow',
    });

    console.log(`✅ Seeded ${keywords.length} keywords`);
    return keywords;
}

async function seedSerpCompetitors(keywords: any[]) {
    console.log('🌱 Seeding SERP competitors...');

    const competitors = [];
    for (const keyword of keywords) {
        for (let rank = 1; rank <= 10; rank++) {
            competitors.push({
                keyword_id: keyword.keyword_id,
                rank,
                url: `https://competitor${rank}.com/article-${Math.floor(Math.random() * 1000)}`,
                domain: `competitor${rank}.com`,
                title: `${keyword.text} - Competitor ${rank} Article`,
                word_count: Math.floor(Math.random() * 3000) + 1000,
                content_score: Math.random() * 100,
            });
        }
    }

    await clickhouse.insert({
        table: 'serp_competitors',
        values: competitors,
        format: 'JSONEachRow',
    });

    console.log(`✅ Seeded ${competitors.length} SERP competitors`);
}

async function seedAudits(pages: any[]) {
    console.log('🌱 Seeding audits...');

    const audits = pages.map(page => ({
        page_id: page.page_id,
        audit_id: uuidv4(),
        created_at: randomDate(new Date(2024, 0, 1), new Date()),
        content_score: Math.random() * 100,
        structure_score: Math.random() * 100,
        missing_keywords: sampleKeywords.slice(0, Math.floor(Math.random() * 3)),
        nlp_term_coverage: Math.random(),
    }));

    await clickhouse.insert({
        table: 'audits',
        values: audits,
        format: 'JSONEachRow',
    });

    console.log(`✅ Seeded ${audits.length} audits`);
}

async function seedInternalLinkRecommendations(pages: any[]) {
    console.log('🌱 Seeding internal link recommendations...');

    const recommendations = [];
    for (let i = 0; i < Math.min(pages.length, 20); i++) {
        const sourcePage = pages[i];
        const targetPage = pages[Math.floor(Math.random() * pages.length)];

        if (sourcePage.page_id !== targetPage.page_id) {
            recommendations.push({
                source_page_id: sourcePage.page_id,
                target_page_id: targetPage.page_id,
                anchor_text: sampleKeywords[Math.floor(Math.random() * sampleKeywords.length)],
                relevance_score: Math.random(),
                reason: 'Semantic similarity detected',
            });
        }
    }

    await clickhouse.insert({
        table: 'internal_link_recommendations',
        values: recommendations,
        format: 'JSONEachRow',
    });

    console.log(`✅ Seeded ${recommendations.length} link recommendations`);
}

async function seedGscData(projects: any[]) {
    console.log('🌱 Seeding GSC search analytics (sample data)...');

    const gscData = [];
    const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
    });

    for (const project of projects.slice(0, 2)) { // Only seed for first 2 projects
        for (const date of last30Days) {
            for (const keyword of sampleKeywords.slice(0, 5)) {
                gscData.push({
                    site_url: `https://${project.domain}/`,
                    project_id: project.project_id,
                    query: keyword,
                    page: `https://${project.domain}${samplePages[Math.floor(Math.random() * samplePages.length)].path}`,
                    date,
                    clicks: Math.floor(Math.random() * 100),
                    impressions: Math.floor(Math.random() * 1000) + 100,
                    ctr: parseFloat((Math.random() * 0.1).toFixed(4)),
                    position: parseFloat((Math.random() * 20 + 1).toFixed(1)),
                    country: 'USA',
                    device: Math.random() > 0.5 ? 'DESKTOP' : 'MOBILE',
                    ingested_at: new Date(),
                });
            }
        }
    }

    await clickhouse.insert({
        table: 'gsc_search_analytics',
        values: gscData,
        format: 'JSONEachRow',
    });

    console.log(`✅ Seeded ${gscData.length} GSC data points`);
}

async function main() {
    console.log('🚀 Starting database seeding...\n');

    try {
        // Seed in order of dependencies
        const projects = await seedProjects();
        const pages = await seedPages(projects);
        const keywords = await seedKeywordMetrics();

        await seedSerpCompetitors(keywords);
        await seedAudits(pages);
        await seedInternalLinkRecommendations(pages);
        await seedGscData(projects);

        console.log('\n✨ Database seeding completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`   - ${projects.length} projects`);
        console.log(`   - ${pages.length} pages`);
        console.log(`   - ${keywords.length} keywords`);
        console.log(`   - Sample SERP, audit, and GSC data`);

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    } finally {
        await clickhouse.close();
    }
}

main();
