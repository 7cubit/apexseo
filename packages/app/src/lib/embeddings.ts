import { pipeline } from "@xenova/transformers";

// Singleton to hold the pipeline
let extractor: any = null;

export async function getExtractor() {
    if (!extractor) {
        extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    }
    return extractor;
}

export async function generateEmbedding(text: string): Promise<number[]> {
    try {
        const pipe = await getExtractor();
        const output = await pipe(text, { pooling: "mean", normalize: true });
        return Array.from(output.data);
    } catch (error) {
        console.error("Embedding generation failed:", error);
        // Return zero vector as fallback or rethrow
        return new Array(384).fill(0);
    }
}
