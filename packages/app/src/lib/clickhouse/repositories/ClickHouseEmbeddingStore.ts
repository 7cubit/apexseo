import { client } from '../../clickhouse';

export class ClickHouseEmbeddingStore {
    static async saveEmbedding(siteId: string, pageId: string, embedding: number[], clusterId?: string) {
        if (!client) return;
        await client.insert({
            table: 'page_embeddings',
            values: [{ site_id: siteId, page_id: pageId, embedding, cluster_id: clusterId }],
            format: 'JSONEachRow',
        });
    }

    static async getEmbedding(siteId: string, pageId: string) {
        if (!client) return null;
        const result = await client.query({
            query: `SELECT embedding FROM page_embeddings WHERE site_id = {siteId:String} AND page_id = {pageId:String}`,
            query_params: { siteId, pageId },
            format: 'JSONEachRow',
        });
        const rows = await result.json();
        return rows.length > 0 ? (rows[0] as any).embedding : null;
    }
}
