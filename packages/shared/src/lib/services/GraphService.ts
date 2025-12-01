import { getDriver } from '../neo4j';

export class GraphService {
    static async getGraph(siteId: string) {
        const driver = getDriver();
        const session = driver.session();

        try {
            // Fetch nodes and edges
            // Limit to 1000 nodes for visualization performance
            const result = await session.run(`
                MATCH (p:Page {projectId: $siteId})
                OPTIONAL MATCH (p)-[r:LINKS_TO]->(t:Page {projectId: $siteId})
                RETURN p, r, t
                LIMIT 1000
            `, { siteId });

            const nodes = new Map();
            const edges: any[] = [];

            result.records.forEach((record: any) => {
                const source = record.get('p');
                const target = record.get('t');
                const rel = record.get('r');

                if (source) {
                    nodes.set(source.properties.pageId, {
                        id: source.properties.pageId,
                        type: 'custom', // Custom node type for React Flow
                        position: { x: 0, y: 0 }, // Layout will be handled by frontend (dagre/elk)
                        data: {
                            url: source.properties.url,
                            title: source.properties.title,
                            tspr: source.properties.tspr || 0.1,
                            clusterId: source.properties.clusterId,
                            isOrphan: source.properties.isOrphan
                        }
                    });
                }

                if (target) {
                    nodes.set(target.properties.pageId, {
                        id: target.properties.pageId,
                        type: 'custom',
                        position: { x: 0, y: 0 },
                        data: {
                            url: target.properties.url,
                            title: target.properties.title,
                            tspr: target.properties.tspr || 0.1,
                            clusterId: target.properties.clusterId,
                            isOrphan: target.properties.isOrphan
                        }
                    });
                }

                if (rel && source && target) {
                    edges.push({
                        id: `e${source.properties.pageId}-${target.properties.pageId}`,
                        source: source.properties.pageId,
                        target: target.properties.pageId,
                        animated: false,
                        label: rel.properties.anchorText || ''
                    });
                }
            });

            return {
                nodes: Array.from(nodes.values()),
                edges
            };
        } finally {
            await session.close();
        }
    }

    static async getClusters(siteId: string) {
        const driver = getDriver();
        const session = driver.session();

        try {
            const result = await session.run(`
                MATCH (p:Page {projectId: $siteId})
                WHERE p.clusterId IS NOT NULL
                RETURN p.clusterId as clusterId, count(p) as count, avg(p.tspr) as avgTspr
                ORDER BY count DESC
            `, { siteId });

            return result.records.map((r: any) => ({
                id: r.get('clusterId'),
                count: r.get('count').toNumber(),
                avgTspr: r.get('avgTspr')
            }));
        } finally {
            await session.close();
        }
    }
}
