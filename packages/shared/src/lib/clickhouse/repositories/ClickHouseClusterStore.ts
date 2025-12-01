import { client } from '../../clickhouse';

export interface Cluster {
    site_id: string;
    cluster_id: string;
    label: string;
    keywords: string[];
    page_count: number;
    avg_health_score: number;
}

export class ClickHouseClusterStore {
    static async createTable() {
        if (!client) return;
        await client.command({
            query: `
                CREATE TABLE IF NOT EXISTS clusters (
                    site_id String,
                    cluster_id String,
                    label String,
                    keywords Array(String),
                    page_count UInt32,
                    avg_health_score Float32
                ) ENGINE = MergeTree()
                ORDER BY (site_id, cluster_id)
            `
        });
    }

    static async saveCluster(cluster: Cluster) {
        if (!client) return;
        await client.insert({
            table: 'clusters',
            values: [cluster],
            format: 'JSONEachRow',
        });
    }

    static async getClusters(siteId: string) {
        if (!client) return [];
        const result = await client.query({
            query: `SELECT * FROM clusters WHERE site_id = {siteId:String}`,
            query_params: { siteId },
            format: 'JSONEachRow',
        });
        return await result.json();
    }
}
