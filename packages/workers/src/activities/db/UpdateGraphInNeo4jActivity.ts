import { savePageWithLinks } from '@apexseo/shared';
import { CrawledPage } from '../http/CrawlPageActivity';

export async function updateGraphInNeo4j(page: CrawledPage & { siteId: string }): Promise<void> {
    console.log(`Updating graph for ${page.url} in Neo4j`);

    const neo4jData = {
        url: page.url,
        title: page.title,
        internalLinks: page.links.filter(l => l.isInternal).map(l => ({
            url: l.url,
            text: l.text
        }))
    };

    await savePageWithLinks(page.siteId, neo4jData);
}
