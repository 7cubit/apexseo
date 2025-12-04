import { driver, DATABASE } from '@apexseo/shared';

export class GraphService {
    async getSubgraph(siteId: string, depth: number = 2, limit: number = 100) {
        const session = driver.session({ database: DATABASE });
        try {
            const result = await session.run(`
                MATCH (s:Site {id: $siteId})<-[:BELONGS_TO]-(startNode:Page)
                WITH startNode LIMIT 1
                CALL apoc.path.subgraphAll(startNode, {
                    maxLevel: $depth,
                    relationshipFilter: 'LINKS_TO>',
                    limit: $limit
                })
                YIELD nodes, relationships
                RETURN nodes, relationships
            `, { siteId, depth, limit });

            if (result.records.length === 0) {
                return { nodes: [], links: [] };
            }

            const record = result.records[0];
            const nodes = record.get('nodes').map((node: any) => ({
                id: node.properties.page_id,
                label: node.labels[0],
                ...node.properties
            }));
            const links = record.get('relationships').map((rel: any) => ({
                source: rel.startNodeElementId, // Note: elementId in Neo4j 5+
                target: rel.endNodeElementId,
                type: rel.type
            }));

            return { nodes, links };
        } finally {
            await session.close();
        }
    }

    async getPageRank(siteId: string) {
        const session = driver.session({ database: DATABASE });
        try {
            const result = await session.run(`
                MATCH (p:Page)-[:BELONGS_TO]->(s:Site {id: $siteId})
                RETURN p.url as url, p.pageRank as score
                ORDER BY score DESC
                LIMIT 50
            `, { siteId });

            return result.records.map(record => ({
                url: record.get('url'),
                score: record.get('score')
            }));
        } finally {
            await session.close();
        }
    }
}
