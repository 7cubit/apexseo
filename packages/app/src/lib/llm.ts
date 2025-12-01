import OpenAI from 'openai';

const openai = process.env.OPENAI_API_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

export interface ExtractedClaim {
    subject: string;
    relation: string;
    object: string;
    text: string;
}

export async function extractClaims(text: string): Promise<ExtractedClaim[]> {
    if (!openai) {
        console.warn("OPENAI_API_KEY not found, using mock claim extraction.");
        return mockExtractClaims(text);
    }

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a fact-checking assistant. Extract 3 factual claims from the provided text. Format the output as a JSON array of objects with keys: subject, relation, object, text. The 'text' field should be the exact sentence or clause from the source."
                },
                {
                    role: "user",
                    content: text
                }
            ],
            response_format: { type: "json_object" }
        });

        const content = response.choices[0].message.content;
        if (!content) return [];

        const result = JSON.parse(content);
        return result.claims || result; // Handle potential variations in JSON structure
    } catch (error) {
        console.error("Error calling OpenAI:", error);
        return mockExtractClaims(text);
    }
}

function mockExtractClaims(text: string): ExtractedClaim[] {
    // Simple heuristic: find sentences with numbers
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    const claims: ExtractedClaim[] = [];

    for (const sentence of sentences) {
        if (/\d+/.test(sentence) && sentence.length > 20) {
            claims.push({
                subject: "Unknown",
                relation: "contains",
                object: "number",
                text: sentence.trim()
            });
            if (claims.length >= 3) break;
        }
    }
    return claims;
}
