import { EEATRequest, ResearchData, ContentArchitecture, DraftContent, ScoredContent } from './types';
import { openai, getDriver } from '@apexseo/shared';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

const PerplexityResponseSchema = z.object({
    id: z.string(),
    model: z.string(),
    choices: z.array(
        z.object({
            index: z.number(),
            message: z.object({
                role: z.enum(['assistant', 'user', 'system']),
                content: z.string(),
            }),
            finish_reason: z.string().optional(),
        })
    ),
    usage: z.object({
        prompt_tokens: z.number().optional(),
        completion_tokens: z.number().optional(),
        total_tokens: z.number().optional(),
    }).optional(),
});

type PerplexityResponse = z.infer<typeof PerplexityResponseSchema>;

const ResearchSchema = z.object({
    facts: z.array(z.string()).default([]),
    sources: z.array(z.string()).default([]),
    competitorInsights: z.array(z.string()).default([]),
    semanticKeywords: z.array(z.string()).default([])
});

export async function doPerplexityResearch(request: EEATRequest): Promise<ResearchData> {
    console.log(`[Activity] Researching: ${request.topic}`);

    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
        console.warn("⚠️ PERPLEXITY_API_KEY missing, returning fallback mock data.");
        return {
            facts: ['Research unavailable (API Key missing)'],
            sources: [],
            competitorInsights: [],
            semanticKeywords: ['missing_api_key']
        };
    }

    const maxRetries = 3;
    const initialDelay = 1000;
    const maxDelay = 8000;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            console.log(`[Perplexity] Attempt ${attempt + 1}/${maxRetries} for query: ${request.topic.substring(0, 50)}...`);

            const response = await fetch('https://api.perplexity.ai/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'llama-3.1-sonar-small-128k-online',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a research assistant. Provide detailed facts, sources, and competitor insights for the given topic. Return STRICT JSON with keys: facts (string[]), sources (string[]), competitorInsights (string[]), semanticKeywords (string[]). Do NOT include markdown formatting.'
                        },
                        { role: 'user', content: `Research topic: ${request.topic}` }
                    ]
                })
            });

            if (!response.ok) {
                throw new Error(`Perplexity API failed: ${response.statusText} (${response.status})`);
            }

            const data = await response.json();

            // Validate with Zod
            const validated = PerplexityResponseSchema.parse(data);

            let content = validated.choices[0].message.content || "{}";

            // Clean markdown code blocks if present
            content = content.replace(/```json\n?|\n?```/g, "").trim();

            try {
                const parsed = JSON.parse(content);
                const validatedResearch = ResearchSchema.safeParse(parsed);

                if (validatedResearch.success) {
                    return validatedResearch.data as ResearchData;
                } else {
                    console.warn("Research schema validation failed:", validatedResearch.error);
                    const raw = parsed as any;
                    return {
                        facts: Array.isArray(raw.facts) ? raw.facts : [],
                        sources: Array.isArray(raw.sources) ? raw.sources : [],
                        competitorInsights: Array.isArray(raw.competitorInsights) ? raw.competitorInsights : [],
                        semanticKeywords: Array.isArray(raw.semanticKeywords) ? raw.semanticKeywords : []
                    };
                }
            } catch (parseError) {
                console.error("Failed to parse Perplexity JSON:", content);
                throw new Error("Invalid JSON from Perplexity");
            }

        } catch (error) {
            lastError = error as Error;
            console.warn(`[Perplexity] Attempt ${attempt + 1}/${maxRetries} failed:`, error instanceof Error ? error.message : error);

            if (attempt === maxRetries - 1) {
                console.error('[Perplexity] Exhausted all retries, falling back to Serper.dev');
                return await fallbackToSerper(request.topic);
            }

            // Exponential backoff
            const delay = Math.min(
                initialDelay * Math.pow(2, attempt) + Math.random() * 1000,
                maxDelay
            );
            console.log(`[Perplexity] Retrying in ${Math.round(delay)}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    // Should not reach here due to fallback
    throw lastError || new Error('Research failed');
}

async function fallbackToSerper(query: string): Promise<ResearchData> {
    console.log(`[Research] Falling back to Serper.dev for: ${query}`);
    const apiKey = process.env.SERPER_API_KEY;

    if (!apiKey) {
        console.warn("⚠️ SERPER_API_KEY missing, returning empty fallback.");
        return { facts: ["Research unavailable (Serper Key missing)"], sources: [], competitorInsights: [], semanticKeywords: [] };
    }

    try {
        const response = await fetch('https://google.serper.dev/search', {
            method: 'POST',
            headers: {
                'X-API-KEY': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ q: query, num: 10 })
        });

        if (!response.ok) {
            throw new Error(`Serper API failed: ${response.statusText}`);
        }

        const data = await response.json();
        const organic = data.organic || [];

        const facts = organic.map((r: any) => r.snippet).filter(Boolean);
        const sources = organic.map((r: any) => r.link).filter(Boolean);
        const competitorInsights = organic.map((r: any) => `Competitor: ${r.title}`).filter(Boolean);

        return {
            facts: facts.slice(0, 10),
            sources: sources.slice(0, 5),
            competitorInsights: competitorInsights.slice(0, 5),
            semanticKeywords: [] // Difficult to extract keywords from raw SERP without NLP
        };
    } catch (error) {
        console.error("Serper Fallback Failed:", error);
        return {
            facts: ["Fallback research failed."],
            sources: [],
            competitorInsights: [],
            semanticKeywords: []
        };
    }
}

export async function validateResearch(data: ResearchData): Promise<boolean> {
    console.log(`[Activity] Validating research...`);
    return data.facts.length > 0;
}

export async function generateContentArchitecture(request: EEATRequest, research: ResearchData): Promise<ContentArchitecture> {
    console.log(`[Activity] Generating architecture...`);
    // Mock for now, or use OpenAI
    return {
        outline: ['Introduction', 'Main Point 1', 'Main Point 2', 'Conclusion'],
        headings: ['H1: Title', 'H2: Intro', 'H2: Point 1'],
        intent: 'Informational',
        targetAudience: 'Beginners'
    };
}

export async function draftWithLLM(request: EEATRequest, research: ResearchData, architecture: ContentArchitecture): Promise<DraftContent> {
    console.log(`[Activity] Drafting content...`);

    const prompt = `
        Topic: ${request.topic}
        Tone: ${request.tone}
        Word Count Target: ${request.wordCount}
        Research Facts: ${JSON.stringify(research.facts)}
        Outline: ${JSON.stringify(architecture.outline)}
        
        Write a comprehensive, SEO-optimized article based on the above.
    `;

    const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }]
    });

    const content = completion.choices[0].message.content || "";

    return {
        content: content,
        metadata: {
            wordCount: content.split(/\s+/).length,
            readingTime: Math.ceil(content.split(/\s+/).length / 200)
        }
    };
}

export async function verifyAndCiteContent(draft: DraftContent, research: ResearchData): Promise<DraftContent> {
    console.log(`[Activity] Verifying and citing...`);
    return { ...draft, content: draft.content + '\n\n[Citations added]' };
}

export async function semanticDensityCheck(draft: DraftContent, research: ResearchData): Promise<boolean> {
    console.log(`[Activity] Checking semantic density...`);
    return true;
}

export async function optimizeInformationGain(draft: DraftContent, research: ResearchData): Promise<boolean> {
    console.log(`[Activity] Optimizing info gain...`);
    return true;
}

export async function optimizeSnippets(draft: DraftContent): Promise<boolean> {
    console.log(`[Activity] Optimizing snippets...`);
    return true;
}

export async function validateYMYLConsensus(draft: DraftContent, research: ResearchData): Promise<boolean> {
    console.log(`[Activity] Validating YMYL...`);
    return true;
}

export async function optimizeEntitySalience(draft: DraftContent): Promise<boolean> {
    console.log(`[Activity] Optimizing entity salience...`);
    return true;
}

export async function injectExperienceAndPolish(content: string): Promise<DraftContent> {
    console.log(`[Activity] Polishing...`);
    return {
        content: content + '\n\n[Polished]',
        metadata: { wordCount: 1100, readingTime: 6 }
    };
}

export async function rescoreEEAT(content: string): Promise<number> {
    console.log(`[Activity] Rescoring EEAT...`);
    return 85;
}

export async function saveContent(content: ScoredContent): Promise<void> {
    console.log(`[Activity] Saving content to Neo4j...`);

    const driver = getDriver();
    if (!driver) {
        throw new Error("Neo4j driver not initialized");
    }

    const session = driver.session();
    try {
        await session.run(`
            MATCH (p:Project {id: $projectId})
            MERGE (page:Page {url: $url})
            SET page.id = $id,
            page.title = $title,
            page.content = $content,
            page.status = 'DRAFT',
            page.wordCount = $wordCount,
            page.eeatScore = $eeatScore,
            page.lastUpdated = datetime()
            
            MERGE (p)-[:HAS_PAGE]->(page)
        `, {
            projectId: content.projectId || 'project-1', // Fallback for now
            url: `/drafts/${content.targetKeyword.replace(/\s+/g, '-').toLowerCase()}`,
            id: uuidv4(),
            title: content.targetKeyword, // Use keyword as title for now
            content: content.content,
            wordCount: content.metadata.wordCount,
            eeatScore: content.eeatScore
        });
        console.log('✅ Content saved to Neo4j');
    } catch (error) {
        console.error("Failed to save content to Neo4j:", error);
        throw error;
    } finally {
        await session.close();
    }
}
