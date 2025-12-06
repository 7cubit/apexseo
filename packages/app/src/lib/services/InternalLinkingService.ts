import { OpenAI } from 'openai';
import { ProjectRepository, PublishedPost } from '../neo4j/repositories/ProjectRepository';

export interface InternalLinkSuggestion {
    postId: string;
    title: string;
    url: string;
    targetKeyword: string;
    relevanceScore: number;
    suggestedAnchorText: string;
    insertionPoint: string;
}

export class InternalLinkingService {
    private openai: OpenAI;

    constructor() {
        this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }

    async findInternalLinkOpportunities(
        targetKeyword: string,
        draftContent: string,
        projectId: string
    ): Promise<InternalLinkSuggestion[]> {
        // Step 1: Get published content from Neo4j
        const publishedPosts = await ProjectRepository.getPublishedContent(projectId);

        if (publishedPosts.length === 0) {
            return [];
        }

        // Step 2: Calculate semantic similarity
        // We embed the draft content and all published posts
        // Note: In production, published post embeddings should be cached in Vector DB (Neo4j/ClickHouse/Pinecone)
        // For this implementation, we'll generate them on the fly (expensive but matches prompt logic)

        const inputs = [draftContent, ...publishedPosts.map(p => p.content || p.title)]; // Fallback to title if content empty

        // Batching might be needed if inputs > 2048 tokens or array length limit
        // OpenAI limit is usually 2048 dimensions, but batch size is flexible.
        // We'll slice to top 20 for safety in this demo
        const limitedInputs = inputs.slice(0, 20);
        const limitedPosts = publishedPosts.slice(0, 19);

        try {
            const embeddings = await this.openai.embeddings.create({
                model: 'text-embedding-3-small',
                input: limitedInputs
            });

            const draftEmbedding = embeddings.data[0].embedding;

            const similarities = limitedPosts.map((post, i) => ({
                post,
                similarity: this.cosineSimilarity(draftEmbedding, embeddings.data[i + 1].embedding)
            }));

            // Sort by similarity desc
            similarities.sort((a, b) => b.similarity - a.similarity);

            // Take top 5 relevant posts
            const topMatches = similarities.filter(s => s.similarity > 0.5).slice(0, 5); // Threshold 0.5

            if (topMatches.length === 0) return [];

            // Step 3: Context-aware anchor text generation
            // We'll generate suggestions for the top match (or all)
            // The prompt asks for "Return top 5 suggestions".
            // Generating anchor text for all 5 might be slow sequentially.
            // We'll do it in parallel.

            const suggestions = await Promise.all(topMatches.map(async (match) => {
                const prompt = `
                Given this draft paragraph:
                "${draftContent.substring(0, 500)}..."
                
                And this related article:
                Title: "${match.post.title}"
                Target Keyword: "${match.post.targetKeyword || match.post.title}"
                
                Suggest a natural anchor text phrase (2-5 words) to link to this article.
                Rules: Use semantic variation, avoid exact match, must fit conversational flow.
                
                Output (JSON): { "anchorText": "...", "insertionPoint": "after sentence X" }
                `;

                try {
                    const completion = await this.openai.chat.completions.create({
                        model: 'gpt-3.5-turbo', // Faster/Cheaper for this task
                        messages: [{ role: 'user', content: prompt }],
                        response_format: { type: "json_object" },
                        temperature: 0.7,
                    });

                    const result = JSON.parse(completion.choices[0].message.content || '{}');

                    return {
                        postId: match.post.id,
                        title: match.post.title,
                        url: match.post.url,
                        targetKeyword: match.post.targetKeyword || '',
                        relevanceScore: match.similarity,
                        suggestedAnchorText: result.anchorText || match.post.title,
                        insertionPoint: result.insertionPoint || 'end of paragraph'
                    };
                } catch (e) {
                    console.error("Failed to generate anchor text", e);
                    return null;
                }
            }));

            return suggestions.filter((s): s is InternalLinkSuggestion => s !== null);

        } catch (error) {
            console.error("Error in findInternalLinkOpportunities", error);
            return [];
        }
    }

    private cosineSimilarity(vecA: number[], vecB: number[]): number {
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}
