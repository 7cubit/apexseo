import { driver, DATABASE } from '../driver';

export interface Site {
    id: string;
    url: string;
    projectId: string;
    lastCrawled?: string;
    pageCount?: number;
    linkCount?: number;
}

export class SiteRepository {
    static async createOrUpdateSite(site: Site) {
        if (!driver) return null;
        const session = driver.session({ database: DATABASE });
        try {
            await session.run(
                `
        MERGE (s:Site {id: $id})
        SET s.url = $url, 
            s.project_id = $projectId,
            s.last_crawled = datetime(),
            s.page_count = coalesce(s.page_count, 0),
            s.link_count = coalesce(s.link_count, 0)
        RETURN s
        `,
                site
            );
        } finally {
            await session.close();
        }
    }

    static async findSiteById(id: string) {
        if (!driver) return null;
        const session = driver.session({ database: DATABASE });
        try {
            const result = await session.run(
                `MATCH (s:Site {id: $id}) RETURN s`,
                { id }
            );
            if (result.records.length === 0) return null;
            return result.records[0].get('s').properties;
        } finally {
            await session.close();
        }
    }

    static async updateCrawlStats(id: string, stats: { pageCount: number, linkCount: number }) {
        if (!driver) return null;
        const session = driver.session({ database: DATABASE });
        try {
            await session.run(
                `
        MATCH (s:Site {id: $id})
        SET s.page_count = $pageCount,
            s.link_count = $linkCount,
            s.last_crawled = datetime()
        `,
                { id, ...stats }
            );
        } finally {
            await session.close();
        }
    }
}
