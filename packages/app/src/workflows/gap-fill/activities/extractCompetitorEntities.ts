import { CompetitorContent, ExtractedEntities } from '../types';

export async function extractCompetitorEntities(
    content: CompetitorContent[]
): Promise<ExtractedEntities> {
    const allEntities = new Set<string>();

    for (const item of content) {
        // Simple heuristic extraction (Capitalized words)
        // In production, use OpenAI or a dedicated NER library (e.g., compromise, wink-nlp)
        const text = item.content_snippet;
        const matches = text.match(/\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)*\b/g);

        if (matches) {
            matches.forEach(e => {
                if (e.length > 3 && !['The', 'This', 'And', 'For', 'With'].includes(e)) {
                    allEntities.add(e);
                }
            });
        }
    }

    // Convert to array
    const entities = Array.from(allEntities);

    return {
        entities,
        missing_entities: entities // Assuming all are missing for now since we are filling a gap
    };
}
