import neo4j from 'neo4j-driver';

const uri = process.env.NEO4J_URI;
const user = process.env.NEO4J_USER;
const password = process.env.NEO4J_PASSWORD;

let driver: any;

if (uri && user && password) {
    try {
        driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
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

export async function savePage(projectId: string, pageData: any) {
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
