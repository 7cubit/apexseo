import { getDriver } from '../neo4j';

export class TSPRService {
    /**
     * Runs Topic-Sensitive PageRank (or standard PageRank) on the projected graph.
     * @param projectId The project/site ID to filter the graph (optional, if we want to run per-site).
     *                  For now, we might run it on the whole graph or filter by site.
     */
    static async runTSPR(projectId: string) {
        const driver = getDriver();
        if (!driver) return;
        const session = driver.session(); // Use default database
        const graphName = `proj_${projectId.replace(/[^a-zA-Z0-9]/g, '_')}`;

        try {
            console.log(`Starting TSPR for ${projectId}...`);

            // 1. Check if graph exists and drop it if so (to ensure fresh projection)
            const exists = await session.run(`
                CALL gds.graph.exists($graphName) YIELD exists
                RETURN exists
            `, { graphName });

            if (exists.records[0].get('exists')) {
                await session.run(`CALL gds.graph.drop($graphName)`);
            }

            // 2. Project the graph
            // We project Pages and LINKS_TO relationships
            // We filter by site if needed. Assuming we want to run on the subgraph of the site + immediate neighbors?
            // Or just the whole site's pages.
            // Let's project pages belonging to the site.
            // Note: GDS projection with Cypher is flexible.

            console.log(`Projecting graph ${graphName}...`);
            await session.run(`
                CALL gds.graph.project.cypher(
                    $graphName,
                    'MATCH (p:Page) WHERE p.url CONTAINS $projectId RETURN id(p) as id',
                    'MATCH (s:Page)-[r:LINKS_TO]->(t:Page) WHERE s.url CONTAINS $projectId AND t.url CONTAINS $projectId RETURN id(s) as source, id(t) as target'
                )
            `, { graphName, projectId });

            // 3. Run PageRank
            // We can add personalization here if we have topic scores.
            // For MVP, we'll run standard PageRank but store it as 'tspr' for now, 
            // or we can simulate topic sensitivity if we had topic seeds.
            // Let's stick to standard PageRank for the "Truth" foundation first.

            console.log(`Running PageRank on ${graphName}...`);
            const result = await session.run(`
                CALL gds.pageRank.write($graphName, {
                    maxIterations: 20,
                    dampingFactor: 0.85,
                    writeProperty: 'tspr'
                })
                YIELD nodePropertiesWritten, ranIterations, computeMillis
            `, { graphName });

            const stats = result.records[0];
            console.log(`TSPR completed. Written to ${stats.get('nodePropertiesWritten')} nodes.`);

            // 4. Cleanup
            await session.run(`CALL gds.graph.drop($graphName)`);

        } catch (error) {
            console.error('Error running TSPR:', error);
            throw error;
        } finally {
            await session.close();
        }
    }
}
