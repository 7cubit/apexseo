"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageRepository = void 0;
exports.savePageWithLinks = savePageWithLinks;
const driver_1 = require("../driver");
class PageRepository {
    static async createOrUpdatePage(page) {
        if (!driver_1.driver)
            return null;
        const session = driver_1.driver.session({ database: driver_1.DATABASE });
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
        }
        finally {
            await session.close();
        }
    }
    static async addInternalLink(fromUrl, toUrl, weight = 1.0) {
        if (!driver_1.driver)
            return null;
        const session = driver_1.driver.session({ database: driver_1.DATABASE });
        try {
            await session.run(`
        MATCH (a:Page {url: $fromUrl})
        MERGE (b:Page {url: $toUrl})
        MERGE (a)-[r:LINKS_TO]->(b)
        SET r.weight = $weight
        `, { fromUrl, toUrl, weight });
        }
        finally {
            await session.close();
        }
    }
    static async listBySite(siteId) {
        // Assuming pages are linked to site via HAS_PAGE or filtered by URL pattern
        // For now, let's assume we pass a project ID or similar, but the spec says "list pages for a site"
        // We need to link Site -> Page first.
        // Let's assume Site -[:HAS_PAGE]-> Page relationship exists or we filter by URL prefix.
        // The spec says (:Site)-[:HAS_PAGE]->(:Page).
        if (!driver_1.driver)
            return [];
        const session = driver_1.driver.session({ database: driver_1.DATABASE });
        try {
            const result = await session.run(`
        MATCH (s:Site {id: $siteId})-[:HAS_PAGE]->(p:Page)
        RETURN p
        `, { siteId });
            return result.records.map(r => r.get('p').properties);
        }
        finally {
            await session.close();
        }
    }
    static async getTsprResults(projectId) {
        if (!driver_1.driver)
            return [];
        const session = driver_1.driver.session({ database: driver_1.DATABASE });
        try {
            const result = await session.run(`
                MATCH (p:Page)-[:BELONGS_TO]->(:Project {id: $projectId})
                RETURN p.page_id as page_id, p.url as url, p.pr as pr, p.tspr as tspr, p.cluster as cluster, COUNT { (p)<-[:LINKS_TO]-() } as inlinks
                ORDER BY p.tspr DESC
                LIMIT 100
                `, { projectId });
            return result.records.map(r => ({
                page_id: r.get('page_id'),
                url: r.get('url'),
                pr: r.get('pr') || 0,
                tspr: r.get('tspr') || 0,
                cluster: r.get('cluster'),
                inlinks: r.get('inlinks').toNumber()
            }));
        }
        finally {
            await session.close();
        }
    }
    static async getAllLinks(projectId) {
        if (!driver_1.driver)
            return [];
        const session = driver_1.driver.session({ database: driver_1.DATABASE });
        try {
            const result = await session.run(`
                MATCH (p1:Page)-[:BELONGS_TO]->(:Project {id: $projectId})
                MATCH (p1)-[:LINKS_TO]->(p2:Page)
                RETURN p1.page_id as source, p2.page_id as target
                `, { projectId });
            return result.records.map(r => ({
                source: r.get('source'),
                target: r.get('target')
            }));
        }
        finally {
            await session.close();
        }
    }
    static async getCannibalizationConflicts(siteId) {
        var _a;
        if (!driver_1.driver)
            return { conflicts: [], stats: { totalConflicts: 0, affectedPages: 0 } };
        const session = driver_1.driver.session({ database: driver_1.DATABASE });
        try {
            // Fetch conflicts
            const result = await session.run(`
                MATCH (p1:Page {siteId: $siteId})-[r:CANNIBALIZES]->(p2:Page)
                RETURN 
                    p1.url as page1_url, 
                    p1.targetKeyword as page1_keyword,
                    p2.url as page2_url, 
                    p2.targetKeyword as page2_keyword,
                    r.similarity as similarity
                ORDER BY r.similarity DESC
                `, { siteId });
            const conflicts = result.records.map(record => ({
                page1: { url: record.get('page1_url'), keyword: record.get('page1_keyword') },
                page2: { url: record.get('page2_url'), keyword: record.get('page2_keyword') },
                similarity: record.get('similarity')
            }));
            // Get stats
            const statsResult = await session.run(`
                MATCH (p:Page {siteId: $siteId})
                WHERE p.cannibalizationStatus = 'conflict'
                RETURN count(p) as affectedPages
                `, { siteId });
            const affectedPages = ((_a = statsResult.records[0]) === null || _a === void 0 ? void 0 : _a.get('affectedPages').toNumber()) || 0;
            return {
                conflicts,
                stats: {
                    totalConflicts: conflicts.length,
                    affectedPages
                }
            };
        }
        finally {
            await session.close();
        }
    }
}
exports.PageRepository = PageRepository;
/**
 * Saves a page and its internal links to Neo4j.
 */
async function savePageWithLinks(projectId, pageData) {
    if (!driver_1.driver)
        return null;
    const session = driver_1.driver.session({ database: driver_1.DATABASE });
    try {
        // 1. Create/Update Page Node
        // We use page_id derived from URL (base64) as the primary key
        const pageId = Buffer.from(pageData.url).toString('base64');
        await PageRepository.createOrUpdatePage({
            pageId,
            url: pageData.url,
            title: pageData.title,
            h1: pageData.title, // Fallback
            status: 'ok',
            projectId
        });
        // 2. Handle Internal Links
        // We need to create nodes for linked pages (if they don't exist) and create relationships
        if (pageData.internalLinks && pageData.internalLinks.length > 0) {
            const query = `
            MATCH (p:Page {page_id: $pageId})
            UNWIND $links as link
            MERGE (target:Page {page_id: link.pageId})
            ON CREATE SET target.url = link.url, target.status = 'pending', target.created_at = datetime()
            MERGE (p)-[r:LINKS_TO]->(target)
            SET r.text = link.text, r.updated_at = datetime()
            `;
            const links = pageData.internalLinks.map((l) => ({
                pageId: Buffer.from(l.url).toString('base64'),
                url: l.url,
                text: l.text
            }));
            await session.run(query, { pageId, links });
        }
        return { pageId, status: 'ok' };
    }
    catch (error) {
        console.error("Error in savePageWithLinks:", error);
        throw error;
    }
    finally {
        await session.close();
    }
}
