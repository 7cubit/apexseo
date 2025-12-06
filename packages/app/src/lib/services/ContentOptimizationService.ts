import { OpenAI } from 'openai';
import { InternalLinkingService, InternalLinkSuggestion } from './InternalLinkingService';

export interface OptimizedContent {
    optimizedContent: string;
    changesApplied: string[];
    scoreImprovement: {
        before: number;
        after: number;
    };
}

export class ContentOptimizationService {
    private openai: OpenAI;
    private internalLinkingService: InternalLinkingService;

    constructor() {
        this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        this.internalLinkingService = new InternalLinkingService();
    }

    async autoOptimizeContent(
        contentId: string,
        draftContent: string,
        targetKeyword: string,
        projectId: string,
        currentScore: number = 74 // Default or passed from frontend
    ): Promise<OptimizedContent> {

        // Step 1: Pre-fetch Internal Link Opportunities
        // We do this outside the LLM to ensure we link to *actual* existing pages
        let linkSuggestions: InternalLinkSuggestion[] = [];
        try {
            linkSuggestions = await this.internalLinkingService.findInternalLinkOpportunities(
                targetKeyword,
                draftContent,
                projectId
            );
        } catch (error) {
            console.warn("Failed to fetch internal links", error);
        }

        // Format links for the prompt
        const linksContext = linkSuggestions.length > 0
            ? `AVAILABLE INTERNAL LINKS (Insert 3-5 of these where contextually relevant):
               ${linkSuggestions.map(l => `- Anchor: "${l.suggestedAnchorText}" -> URL: ${l.url} (Context: ${l.insertionPoint})`).join('\n')}`
            : 'INTERNAL LINKS: No relevant internal content found. Skip internal linking or link to high-authority external sources if needed.';

        // Step 2: Construct the Master Prompt
        const prompt = `
        ACT AS: ONE-CLICK SEO AUTO-OPTIMIZER
        
        INPUT CONTEXT:
        - Primary Keyword: "${targetKeyword}"
        - Current SEO Score: ${currentScore}
        
        ${linksContext}
        
        OPTIMIZATION SEQUENCE:
        1. KEYWORD DENSITY FIX:
           - If primary keyword "${targetKeyword}" density < 0.5%: Add 2-3 natural mentions.
           - If > 2.5%: Replace some with semantic variations.
        
        2. HEADING IMPROVEMENTS:
           - Ensure "${targetKeyword}" is in H1.
           - Add numbers to H2s for listicles (e.g., "5 Ways to...") if applicable.
           - Make H2s question-based if intent is informational.
        
        3. MISSING SECTIONS:
           - If "FAQ" missing: Generate 3-5 Q&As from content.
           - If "Key Takeaways" missing: Add bulleted summary at top.
        
        4. READABILITY:
           - Break paragraphs > 150 words.
           - Add transition words (however, therefore, additionally).
           - Simplify sentences > 25 words.
        
        5. INTERNAL LINKS:
           - Use the "AVAILABLE INTERNAL LINKS" provided above.
           - Insert them naturally into the text. Do NOT invent fake internal links.
        
        6. CITATIONS:
           - Add [source] markers for stats/claims.
           - Insert "References" section at end if citations are added.
        
        7. CALL-TO-ACTION:
           - If missing, add CTA at end relevant to "${targetKeyword}".
        
        OUTPUT FORMAT (JSON ONLY):
        {
            "optimizedContent": "The full optimized markdown content...",
            "changesApplied": [
                "Added 3 keyword mentions",
                "Inserted internal link to /blog/xyz",
                "Generated FAQ section"
            ],
            "scoreImprovement": { "before": ${currentScore}, "after": <predicted_new_score> }
        }
        
        DRAFT CONTENT:
        ${draftContent}
        `;

        // Step 3: Execute LLM
        try {
            const completion = await this.openai.chat.completions.create({
                model: 'gpt-4-turbo-preview', // Using a smarter model for full content rewriting
                messages: [
                    { role: 'system', content: "You are an expert SEO editor. You output valid JSON only." },
                    { role: 'user', content: prompt }
                ],
                response_format: { type: "json_object" },
                temperature: 0.3, // Lower temperature for adherence to instructions
            });

            const result = JSON.parse(completion.choices[0].message.content || '{}');

            return {
                optimizedContent: result.optimizedContent || draftContent,
                changesApplied: result.changesApplied || [],
                scoreImprovement: result.scoreImprovement || { before: currentScore, after: currentScore }
            };

        } catch (error) {
            console.error("Auto-optimization failed", error);
            throw new Error("Failed to optimize content");
        }
    }
}
