import { driver, DATABASE } from '../driver';

export interface GraphPageData {
    url: string;
    title?: string;
    h1?: string;
    canonicalUrl?: string;
    links: {
        url: string;
        text: string;
        rel?: string; // e.g. 'nofollow'
        isInternal: boolean;
    }[];
    siteId: string; // Domain or Project ID
}

export class GraphRepository {
    static async saveGraphData(data: GraphPageData) {
        if (!driver) return;
        const session = driver.session({ database: DATABASE });
        try {
            const pageId = Buffer.from(data.url).toString('base64');
            const domainName = new URL(data.url).hostname;
            const now = new Date().toISOString();

            // 1. Merge Domain and Page
            await session.run(`
                MERGE (d:Domain {name: $domainName})
                MERGE (p:Page {page_id: $pageId})
                SET p.url = $url, 
                    p.title = $title, 
                    p.h1 = $h1, 
                    p.last_crawled = datetime($now)
                
                MERGE (d)-[:HAS_PAGE]->(p)
            `, {
                domainName,
                pageId,
                url: data.url,
                title: data.title || null,
                h1: data.h1 || null,
                now
            });

            // 2. Handle Canonical
            if (data.canonicalUrl && data.canonicalUrl !== data.url) {
                const canonicalId = Buffer.from(data.canonicalUrl).toString('base64');
                await session.run(`
                    MATCH (p:Page {page_id: $pageId})
                    MERGE (c:Page {page_id: $canonicalId})
                    ON CREATE SET c.url = $canonicalUrl, c.status = 'pending'
                    MERGE (p)-[:CANONICAL_TO]->(c)
                `, {
                    pageId,
                    canonicalId,
                    canonicalUrl: data.canonicalUrl
                });
            }

            // 3. Handle Links
            if (data.links.length > 0) {
                // Filter out self-loops
                const validLinks = data.links.filter(l => l.url !== data.url);

                // Batch links to avoid massive transaction
                // We'll assume the list isn't huge (e.g. < 1000)
                // If huge, we should chunk it.

                const links = validLinks.map(l => ({
                    targetId: Buffer.from(l.url).toString('base64'),
                    url: l.url,
                    text: l.text,
                    rel: l.rel || 'dofollow',
                    isInternal: l.isInternal
                }));

                if (links.length > 0) {
                    await session.run(`
                        MATCH (p:Page {page_id: $pageId})
                        UNWIND $links as link
                        
                        MERGE (target:Page {page_id: link.targetId})
                        ON CREATE SET target.url = link.url, target.status = 'pending', target.created_at = datetime($now)
                        
                        MERGE (p)-[r:LINKS_TO {url: link.url}]->(target)
                        ON CREATE SET r.first_seen = datetime($now)
                        SET r.last_seen = datetime($now),
                            r.anchor = link.text,
                            r.rel = link.rel,
                            r.is_internal = link.isInternal
                    `, {
                        pageId,
                        links,
                        now
                    });
                }
            }

        } catch (error) {
            console.error('Error saving graph data:', error);
            throw error;
        } finally {
            await session.close();
        }
    }

    static async findOrphanPages(domainName: string): Promise<string[]> {
        if (!driver) return [];
        const session = driver.session({ database: DATABASE });
        try {
            // Find pages belonging to the domain that have NO incoming internal links
            // We assume pages are connected to Domain via HAS_PAGE
            const result = await session.run(`
                MATCH (d:Domain {name: $domainName})-[:HAS_PAGE]->(p:Page)
                WHERE NOT EXISTS {
                    MATCH (other:Page)-[r:LINKS_TO]->(p)
                    WHERE r.is_internal = true
                }
                RETURN p.url as url
            `, { domainName });

            return result.records.map(r => r.get('url'));
        } catch (error) {
            console.error('Error finding orphan pages:', error);
            return [];
        } finally {
            await session.close();
        }
    }

    static async validateIntegrity(): Promise<{ valid: boolean, errors: string[] }> {
        if (!driver) return { valid: false, errors: ['Driver not initialized'] };
        const session = driver.session({ database: DATABASE });
        const errors: string[] = [];
        try {
            // 1. Check for self-loops
            const selfLoops = await session.run(`
                MATCH (p:Page)-[r:LINKS_TO]->(p)
                RETURN count(r) as count
            `);
            const selfLoopCount = selfLoops.records[0].get('count').toNumber();
            if (selfLoopCount > 0) {
                errors.push(`Found ${selfLoopCount} self-loops (Page links to itself via LINKS_TO)`);
            }

            // 2. Check for pages without site/domain connection (orphaned from domain structure)
            // Every CRAWLED page should belong to a domain/site via HAS_PAGE
            // Pending pages (targets of links) might not be connected yet if they are external or not processed.
            const disconnectedPages = await session.run(`
                MATCH (p:Page)
                WHERE p.last_crawled IS NOT NULL AND NOT (p)<-[:HAS_PAGE]-()
                RETURN count(p) as count
            `);
            const disconnectedCount = disconnectedPages.records[0].get('count').toNumber();
            if (disconnectedCount > 0) {
                errors.push(`Found ${disconnectedCount} CRAWLED pages not connected to any Domain via HAS_PAGE`);
            }

            return { valid: errors.length === 0, errors };
        } catch (error: any) {
            console.error('Error validating graph:', error);
            return { valid: false, errors: [error.message] };
        } finally {
            await session.close();
        }
    }
}
