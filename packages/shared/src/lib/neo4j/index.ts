import neo4j from 'neo4j-driver';

const uri = process.env.NEO4J_URI;
const user = process.env.NEO4J_USER;
const password = process.env.NEO4J_PASSWORD;
export const DATABASE = process.env.NEO4J_DATABASE || 'neo4j';

export let driver: any;

if (uri && user && password) {
    try {
        driver = neo4j.driver(uri, neo4j.auth.basic(user, password), { disableLosslessIntegers: true });
    } catch (error) {
        console.error("Failed to create Neo4j driver:", error);
    }
} else {
    console.warn("Neo4j environment variables are missing.");
}

export const getDriver = () => driver;

export const closeDriver = async () => {
    if (driver) {
        await driver.close();
    }
};

export async function createProject(id: string, name: string, url: string) {
    if (!driver) return null;
    const session = driver.session();
    try {
        const result = await session.run(
            `
      MERGE (p:Project {id: $id})
      SET p.name = $name, p.url = $url, p.createdAt = datetime()
      RETURN p
      `,
            { id, name, url }
        );
        return result.records[0].get('p').properties;
    } catch (error) {
        console.error("Error creating project:", error);
        throw error;
    } finally {
        await session.close();
    }
}

/**
 * @deprecated Use PageRepository.savePageWithLinks instead.
 */
export async function savePage(projectId: string, pageData: any) {
    console.warn("Using deprecated savePage. Please migrate to PageRepository.savePageWithLinks.");
    if (!driver) return null;
    const session = driver.session();
    try {
        const result = await session.run(
            `
      MATCH (p:Project {id: $projectId})
      MERGE (page:Page {url: $url})
      SET page.title = $title, 
          page.text = $text, 
          page.wordCount = $wordCount,
          page.lastCrawled = datetime()
      MERGE (page)-[:BELONGS_TO]->(p)
      WITH page
      UNWIND $internalLinks as link
      MERGE (linkedPage:Page {url: link.url})
      MERGE (page)-[r:LINKS_TO]->(linkedPage)
      SET r.text = link.text
      RETURN page
      `,
            {
                projectId,
                url: pageData.url,
                title: pageData.title,
                text: pageData.text,
                wordCount: pageData.wordCount,
                internalLinks: pageData.internalLinks
            }
        );
        return result.records[0]?.get('page').properties;
    } catch (error) {
        console.error("Error saving page:", error);
        throw error;
    } finally {
        await session.close();
    }
}

export async function updatePageCluster(projectId: string, url: string, clusterId: number, embedding: number[]) {
    if (!driver) return null;
    const session = driver.session();
    try {
        await session.run(
            `
      MATCH (p:Page {url: $url})
      SET p.cluster = $clusterId, p.embedding = $embedding
      `,
            { url, clusterId, embedding }
        );
    } catch (error) {
        console.error("Error updating page cluster:", error);
    } finally {
        await session.close();
    }
}

export async function getProjectPages(projectId: string) {
    if (!driver) return [];
    const session = driver.session();
    try {
        const result = await session.run(
            `
      MATCH (p:Page)-[:BELONGS_TO]->(:Project {id: $projectId})
      RETURN p
      `,
            { projectId }
        );
        return result.records.map((r: any) => r.get('p').properties);
    } catch (error) {
        console.error("Error fetching project pages:", error);
        return [];
    } finally {
        await session.close();
    }
}

export async function saveBacklink(projectId: string, backlink: any) {
    if (!driver) return;
    const session = driver.session();
    try {
        await session.run(`
            MATCH (p:Project {id: $projectId})
            MERGE (d:Domain {domain: $domain})
            SET d.spam_score = $spam_score, d.last_updated = datetime()
            
            MERGE (b:Backlink {url: $backlink_url})
            SET b.anchor_text = $anchor_text, 
                b.is_dofollow = $is_dofollow,
                b.date_found = date($date_found)
            
            MERGE (b)-[:FROM]->(d)
            MERGE (p)-[:RECEIVES]->(b)
        `, {
            projectId,
            domain: backlink.referring_domain,
            spam_score: backlink.spam_score,
            backlink_url: backlink.backlink_url,
            anchor_text: backlink.anchor_text,
            is_dofollow: backlink.is_dofollow,
            date_found: backlink.date_found
        });
    } catch (e) {
        console.error("Error saving backlink to Neo4j", e);
    } finally {
        await session.close();
    }
}
