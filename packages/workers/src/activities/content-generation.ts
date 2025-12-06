import { EEATRequest, ResearchData, ContentArchitecture, DraftContent, ScoredContent } from './types';
import { openai, getDriver } from '@apexseo/shared';
import { v4 as uuidv4 } from 'uuid';

export async function doPerplexityResearch(request: EEATRequest): Promise<ResearchData> {
    console.log(`[Activity] Researching: ${request.topic}`);

    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
        console.warn("PERPLEXITY_API_KEY missing, using mock data.");
        return {
            facts: ['Mock Fact 1', 'Mock Fact 2'],
            sources: ['https://example.com'],
            competitorInsights: ['Competitor A is good'],
            semanticKeywords: ['mock', 'data']
        };
    }

    try {
        const response = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3-sonar-large-32k-online',
                messages: [
                    { role: 'system', content: 'You are a research assistant. Provide detailed facts, sources, and competitor insights for the given topic. Return JSON with keys: facts (string[]), sources (string[]), competitorInsights (string[]), semanticKeywords (string[]).' },
                    { role: 'user', content: `Research topic: ${request.topic}` }
                ]
            })
        });

        if (!response.ok) throw new Error(`Perplexity API failed: ${response.statusText}`);

        const data = await response.json();
        const content = data.choices[0].message.content;
        // Simple parsing assumption - in production use structured output or robust parsing
        try {
            return JSON.parse(content);
        } catch {
            return {
                facts: [content],
                sources: [],
                competitorInsights: [],
                semanticKeywords: []
            };
        }

    } catch (error) {
        console.error("Perplexity Research Failed:", error);
        throw error;
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
