import { OpenAI } from 'openai';
import { ClusterDetails, CompetitorContent, ExtractedEntities, ContentBrief } from '../types';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function generateContentBrief(
    clusterDetails: ClusterDetails,
    competitorContent: CompetitorContent[],
    entities: ExtractedEntities,
    myDomain: string
): Promise<ContentBrief> {
    const prompt = `
    ACT AS: Senior SEO Content Strategist
    TASK: Create a detailed content brief to fill a content gap.
    
    CONTEXT:
    - My Domain: ${myDomain}
    - Target Cluster: ${clusterDetails.cluster_name}
    - Missing Keywords: ${clusterDetails.missing_keywords.join(', ')}
    - Competitor Content Summary: ${competitorContent.map(c => `${c.title} (${c.url})`).join('; ')}
    - Important Entities: ${entities.entities.slice(0, 10).join(', ')}
    
    REQUIREMENTS:
    1. Suggest a high-CTR title.
    2. Outline key H2/H3 sections.
    3. List required entities to mention.
    4. Suggest internal linking opportunities (anchors).
    5. Estimate word count based on competitor depth.
    
    OUTPUT FORMAT: JSON only.
    {
        "suggested_title": "...",
        "outline": ["H2: ...", "H3: ..."],
        "required_entities": ["..."],
        "faq_questions": ["..."],
        "internal_linking": [{"source_page": "...", "anchor": "...", "target_keyword": "..."}],
        "estimated_word_count": 1500,
        "content_angle": "...",
        "missing_keywords": ["..."],
        "competitor_summary": "..."
    }
    `;

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4-turbo-preview', // Or gpt-4o
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: "json_object" },
            temperature: 0.7,
        });

        const content = completion.choices[0].message.content;
        if (!content) throw new Error("Empty response from OpenAI");

        return JSON.parse(content) as ContentBrief;
    } catch (error) {
        console.error("Failed to generate content brief", error);
        throw error;
    }
}
