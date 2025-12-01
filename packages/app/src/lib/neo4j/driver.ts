import neo4j from 'neo4j-driver';

const URI = process.env.NEO4J_URI;
const USER = process.env.NEO4J_USER;
const PASSWORD = process.env.NEO4J_PASSWORD;
export const DATABASE = process.env.NEO4J_DATABASE || 'neo4j';

if (!URI || !USER || !PASSWORD) {
    console.warn("Missing Neo4j environment variables. Neo4j features will be disabled.");
}

export const driver = (URI && USER && PASSWORD)
    ? neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD))
    : null;

export async function closeDriver() {
    if (driver) {
        await driver.close();
    }
}
