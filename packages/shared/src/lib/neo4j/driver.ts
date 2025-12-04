import neo4j, { Driver } from 'neo4j-driver';

export const DATABASE = process.env.NEO4J_DATABASE || 'neo4j';

let driverInstance: Driver | null = null;

export const getDriver = () => {
    if (!driverInstance) {
        const URI = process.env.NEO4J_URI;
        const USER = process.env.NEO4J_USER;
        const PASSWORD = process.env.NEO4J_PASSWORD;

        if (!URI || !USER || !PASSWORD) {
            console.warn("Missing Neo4j environment variables. Neo4j features will be disabled.");
            return null;
        }

        driverInstance = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));
    }
    return driverInstance;
};

export const driver = getDriver(); // For backward compatibility, but might still be null if env vars missing at load time

export async function closeDriver() {
    if (driverInstance) {
        await driverInstance.close();
        driverInstance = null;
    }
}
