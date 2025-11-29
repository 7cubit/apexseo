import { driver, DATABASE } from '../driver';

export interface Page {
    pageId: string;
    url: string;
    title?: string;
    h1?: string;
    status?: string;
    clusterId?: string;
    pr?: number;
    tspr?: number;
    semanticOrphan?: boolean;
    projectId?: string;
}

import { TsprResult } from '@/lib/types';

export class PageRepository {
    static async createOrUpdatePage(page: Page) {
        if (!driver) return null;
        const session = driver.session({ database: DATABASE });
        try {
            const query = `
        MERGE (p:Page {page_id: $pageId})
        SET p.url = $url,
            p.title = $title,
            p.h1 = $h1,
            p.status = $status,
            p.last_crawled = datetime()
        WITH p
        CALL {
            WITH p
            MATCH (proj:Project {id: $projectId})
            MERGE (p)-[:BELONGS_TO]->(proj)
        }
        RETURN p
        `;

            await session.run(query, {
                pageId: page.pageId,
                url: page.url,
                title: page.title || null,
                h1: page.h1 || null,
                status: page.status || 'pending',
                projectId: page.projectId || 'default' // Fallback or handle error if missing? Interface says optional but logic needs it.
            });
        } finally {
            await session.close();
        }
    }

    static async addInternalLink(fromUrl: string, toUrl: string, weight: number = 1.0) {
        if (!driver) return null;
        const session = driver.session({ database: DATABASE });
        try {
            await session.run(
                `
        MATCH (a:Page {url: $fromUrl})
        MERGE (b:Page {url: $toUrl})
        MERGE (a)-[r:LINKS_TO]->(b)
        SET r.weight = $weight
        `,
                { fromUrl, toUrl, weight }
            );
        } finally {
            await session.close();
        }
    }

    static async listBySite(siteId: string) {
        // Assuming pages are linked to site via HAS_PAGE or filtered by URL pattern
        // For now, let's assume we pass a project ID or similar, but the spec says "list pages for a site"
        // We need to link Site -> Page first.
        // Let's assume Site -[:HAS_PAGE]-> Page relationship exists or we filter by URL prefix.
        // The spec says (:Site)-[:HAS_PAGE]->(:Page).
        if (!driver) return [];
        const session = driver.session({ database: DATABASE });
        try {
            const result = await session.run(
                `
        MATCH (s:Site {id: $siteId})-[:HAS_PAGE]->(p:Page)
        RETURN p
        `,
                { siteId }
            );
            return result.records.map(r => r.get('p').properties);
        } finally {
            await session.close();
        }
    }

    static async getTsprResults(projectId: string): Promise<TsprResult[]> {
        if (!driver) return [];
        const session = driver.session({ database: DATABASE });
        try {
            const result = await session.run(
                `
                MATCH (p:Page)-[:BELONGS_TO]->(:Project {id: $projectId})
                RETURN p.page_id as page_id, p.url as url, p.pr as pr, p.tspr as tspr, p.cluster as cluster, COUNT { (p)<-[:LINKS_TO]-() } as inlinks
                ORDER BY p.tspr DESC
                LIMIT 100
                `,
                { projectId }
            );
            return result.records.map(r => ({
                page_id: r.get('page_id'),
                url: r.get('url'),
                pr: r.get('pr') || 0,
                tspr: r.get('tspr') || 0,
                cluster: r.get('cluster'),
                inlinks: r.get('inlinks').toNumber()
            }));
        } finally {
            await session.close();
        }
    }

    static async getAllLinks(projectId: string): Promise<{ source: string; target: string }[]> {
        if (!driver) return [];
        const session = driver.session({ database: DATABASE });
        try {
            const result = await session.run(
                `
                MATCH (p1:Page)-[:BELONGS_TO]->(:Project {id: $projectId})
                MATCH (p1)-[:LINKS_TO]->(p2:Page)
                RETURN p1.page_id as source, p2.page_id as target
                `,
                { projectId }
            );
            return result.records.map(r => ({
                source: r.get('source'),
                target: r.get('target')
            }));
        } finally {
            await session.close();
        }
    }
}
