import { client } from '../../clickhouse';

export interface Cluster {
    site_id: string;
    cluster_id: string;
    label?: string;
    size?: number;
    centroid_embedding?: number[];
    avg_tspr?: number;
}

export class ClickHouseClusterStore {
    static async saveCluster(cluster: Cluster) {
        if (!client) return;
        await client.insert({
            table: 'clusters',
            values: [cluster],
            format: 'JSONEachRow',
        });
    }

    static async getClustersBySite(siteId: string) {
        if (!client) return [];
        const result = await client.query({
            query: `SELECT * FROM clusters WHERE site_id = {siteId:String}`,
            query_params: { siteId },
            format: 'JSONEachRow',
        });
        return await result.json();
    }
}
