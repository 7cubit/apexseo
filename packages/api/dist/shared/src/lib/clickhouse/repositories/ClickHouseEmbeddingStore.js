"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClickHouseEmbeddingStore = void 0;
const clickhouse_1 = require("../../clickhouse");
class ClickHouseEmbeddingStore {
    static async saveEmbedding(siteId, pageId, embedding, clusterId) {
        if (!clickhouse_1.client)
            return;
        await clickhouse_1.client.insert({
            table: 'page_embeddings',
            values: [{ site_id: siteId, page_id: pageId, embedding, cluster_id: clusterId }],
            format: 'JSONEachRow',
        });
    }
    static async getEmbedding(siteId, pageId) {
        if (!clickhouse_1.client)
            return null;
        const result = await clickhouse_1.client.query({
            query: `SELECT embedding FROM page_embeddings WHERE site_id = {siteId:String} AND page_id = {pageId:String}`,
            query_params: { siteId, pageId },
            format: 'JSONEachRow',
        });
        const rows = await result.json();
        return rows.length > 0 ? rows[0].embedding : null;
    }
    static async getAllEmbeddings(siteId) {
        if (!clickhouse_1.client)
            return [];
        const result = await clickhouse_1.client.query({
            query: `SELECT page_id, embedding FROM page_embeddings WHERE site_id = {siteId:String}`,
            query_params: { siteId },
            format: 'JSONEachRow',
        });
        const rows = await result.json();
        return rows.map((r) => ({ pageId: r.page_id, embedding: r.embedding }));
    }
}
exports.ClickHouseEmbeddingStore = ClickHouseEmbeddingStore;
