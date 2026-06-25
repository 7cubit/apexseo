"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExtractor = getExtractor;
exports.generateEmbedding = generateEmbedding;
const transformers_1 = require("@xenova/transformers");
// Singleton to hold the pipeline
let extractor = null;
async function getExtractor() {
    if (!extractor) {
        extractor = await (0, transformers_1.pipeline)("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    }
    return extractor;
}
async function generateEmbedding(text) {
    try {
        const pipe = await getExtractor();
        const output = await pipe(text, { pooling: "mean", normalize: true });
        return Array.from(output.data);
    }
    catch (error) {
        console.error("Embedding generation failed:", error);
        // Return zero vector as fallback or rethrow
        return new Array(384).fill(0);
    }
}
