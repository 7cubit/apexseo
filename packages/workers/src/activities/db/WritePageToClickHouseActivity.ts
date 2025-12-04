import { ClickHousePageRepository } from '@apexseo/shared';
import { CrawledPage } from '../http/CrawlPageActivity';

export async function writePageToClickHouse(page: CrawledPage & { siteId: string }): Promise<void> {
    console.log(`Writing ${page.url} to ClickHouse`);
    await ClickHousePageRepository.createPage({
        site_id: page.siteId,
        page_id: Buffer.from(page.url).toString('base64'),
        url: page.url,
        title: page.title,
        h1: page.h1,
        content: page.content,
        status: page.status.toString(),
        word_count: page.wordCount,
        link_count_internal: page.links.filter(l => l.isInternal).length,
        link_count_external: page.links.filter(l => !l.isInternal).length,
        crawled_at: new Date().toISOString().replace('T', ' ').split('.')[0],
        content_score: 0, // Placeholder
        is_orphan: 0, // Default
        keywords: [] // Placeholder
    });
}
