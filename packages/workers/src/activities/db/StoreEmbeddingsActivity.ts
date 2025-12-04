import { ClickHouseEmbeddingStore } from '@apexseo/shared';

export interface StoreEmbeddingsInput {
    siteId: string;
    pageId: string;
    embedding: number[];
    clusterId?: string;
}

export async function storeEmbeddings(input: StoreEmbeddingsInput): Promise<void> {
    console.log(`Storing embedding for ${input.pageId}`);
    await ClickHouseEmbeddingStore.saveEmbedding(input.siteId, input.pageId, input.embedding, input.clusterId);
}
