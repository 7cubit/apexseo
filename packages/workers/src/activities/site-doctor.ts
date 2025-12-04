import { ClickHousePageRepository } from '@apexseo/shared';

export async function fetchPriorityPages(): Promise<any[]> {
    console.log('Fetching priority pages for Site Doctor...');
    // Mock implementation: return top 10 pages sorted by last_crawled_at
    // In real app: ClickHousePageRepository.getPriorityPages()
    return [
        { url: 'https://example.com/page1', project_id: 'p1' },
        { url: 'https://example.com/page2', project_id: 'p1' }
    ];
}

export async function reCrawlPage(url: string): Promise<any> {
    console.log(`Re-crawling page: ${url}`);
    // Trigger Python worker activity or use local logic
    // For now, mock success
    return { status: 'crawled', url };
}
