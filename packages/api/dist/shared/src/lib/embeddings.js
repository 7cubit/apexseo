"use strict";
// import { pipeline } from "@xenova/transformers";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExtractor = getExtractor;
exports.generateEmbedding = generateEmbedding;
// Singleton to hold the pipeline
let extractor = null;
async function getExtractor() {
    if (!extractor) {
        console.log("Initializing transformer pipeline...");
        // Dynamic import to avoid native crash on boot
        const { pipeline } = await Promise.resolve().then(() => __importStar(require("@xenova/transformers")));
        extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
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
