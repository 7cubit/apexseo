"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClickHouseClusterStore = void 0;
const clickhouse_1 = require("../../clickhouse");
class ClickHouseClusterStore {
    static async createTable() {
        if (!clickhouse_1.client)
            return;
        await clickhouse_1.client.command({
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
    static async saveCluster(cluster) {
        if (!clickhouse_1.client)
            return;
        await clickhouse_1.client.insert({
            table: 'clusters',
            values: [cluster],
            format: 'JSONEachRow',
        });
    }
    static async getClusters(siteId) {
        if (!clickhouse_1.client)
            return [];
        const result = await clickhouse_1.client.query({
            query: `SELECT * FROM clusters WHERE site_id = {siteId:String}`,
            query_params: { siteId },
            format: 'JSONEachRow',
        });
        return await result.json();
    }
}
exports.ClickHouseClusterStore = ClickHouseClusterStore;
