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

    static async getAllEmbeddings(siteId: string): Promise<{ pageId: string, embedding: number[] }[]> {
        if (!client) return [];
        const result = await client.query({
            query: `SELECT page_id, embedding FROM page_embeddings WHERE site_id = {siteId:String}`,
            query_params: { siteId },
            format: 'JSONEachRow',
        });
        const rows = await result.json();
        return rows.map((r: any) => ({ pageId: r.page_id, embedding: r.embedding }));
    }
}
