"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeDriver = exports.getDriver = void 0;
exports.createProject = createProject;
exports.savePage = savePage;
exports.updatePageCluster = updatePageCluster;
exports.getProjectPages = getProjectPages;
exports.saveBacklink = saveBacklink;
const neo4j_driver_1 = __importDefault(require("neo4j-driver"));
const uri = process.env.NEO4J_URI;
const user = process.env.NEO4J_USER;
const password = process.env.NEO4J_PASSWORD;
let driver;
if (uri && user && password) {
    try {
        driver = neo4j_driver_1.default.driver(uri, neo4j_driver_1.default.auth.basic(user, password));
    }
    catch (error) {
        console.error("Failed to create Neo4j driver:", error);
    }
}
else {
    console.warn("Neo4j environment variables are missing.");
}
const getDriver = () => driver;
exports.getDriver = getDriver;
const closeDriver = async () => {
    if (driver) {
        await driver.close();
    }
};
exports.closeDriver = closeDriver;
async function createProject(id, name, url) {
    if (!driver)
        return null;
    const session = driver.session();
    try {
        const result = await session.run(`
      MERGE (p:Project {id: $id})
      SET p.name = $name, p.url = $url, p.createdAt = datetime()
      RETURN p
      `, { id, name, url });
        return result.records[0].get('p').properties;
    }
    catch (error) {
        console.error("Error creating project:", error);
        throw error;
    }
    finally {
        await session.close();
    }
}
/**
 * @deprecated Use PageRepository.savePageWithLinks instead.
 */
async function savePage(projectId, pageData) {
    var _a;
    console.warn("Using deprecated savePage. Please migrate to PageRepository.savePageWithLinks.");
    if (!driver)
        return null;
    const session = driver.session();
    try {
        const result = await session.run(`
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
      `, {
            projectId,
            url: pageData.url,
            title: pageData.title,
            text: pageData.text,
            wordCount: pageData.wordCount,
            internalLinks: pageData.internalLinks
        });
        return (_a = result.records[0]) === null || _a === void 0 ? void 0 : _a.get('page').properties;
    }
    catch (error) {
        console.error("Error saving page:", error);
        throw error;
    }
    finally {
        await session.close();
    }
}
async function updatePageCluster(projectId, url, clusterId, embedding) {
    if (!driver)
        return null;
    const session = driver.session();
    try {
        await session.run(`
      MATCH (p:Page {url: $url})
      SET p.cluster = $clusterId, p.embedding = $embedding
      `, { url, clusterId, embedding });
    }
    catch (error) {
        console.error("Error updating page cluster:", error);
    }
    finally {
        await session.close();
    }
}
async function getProjectPages(projectId) {
    if (!driver)
        return [];
    const session = driver.session();
    try {
        const result = await session.run(`
      MATCH (p:Page)-[:BELONGS_TO]->(:Project {id: $projectId})
      RETURN p
      `, { projectId });
        return result.records.map((r) => r.get('p').properties);
    }
    catch (error) {
        console.error("Error fetching project pages:", error);
        return [];
    }
    finally {
        await session.close();
    }
}
async function saveBacklink(projectId, backlink) {
    if (!driver)
        return;
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
    }
    catch (e) {
        console.error("Error saving backlink to Neo4j", e);
    }
    finally {
        await session.close();
    }
}
