import { driver, DATABASE } from '../driver';

export interface Cluster {
    clusterId: string;
    siteId: string;
    label?: string;
    size?: number;
    centroidVectorId?: string;
}

export class ClusterRepository {
    static async createCluster(cluster: Cluster) {
        if (!driver) return null;
        const session = driver.session({ database: DATABASE });
        try {
            await session.run(
                `
        MERGE (c:Cluster {cluster_id: $clusterId})
        SET c.site_id = $siteId,
            c.label = $label,
            c.size = $size,
            c.centroid_vector_id = $centroidVectorId
        RETURN c
        `,
                cluster
            );
        } finally {
            await session.close();
        }
    }

    static async assignPageToCluster(pageUrl: string, clusterId: string) {
        if (!driver) return null;
        const session = driver.session({ database: DATABASE });
        try {
            await session.run(
                `
        MATCH (p:Page {url: $pageUrl})
        MATCH (c:Cluster {cluster_id: $clusterId})
        MERGE (p)-[:IN_CLUSTER]->(c)
        SET p.cluster_id = $clusterId
        `,
                { pageUrl, clusterId }
            );
        } finally {
            await session.close();
        }
    }
}
