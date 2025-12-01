import { LinkOptimizerService } from '@apexseo/shared';

export async function generateLinkSuggestionsActivity(siteId: string): Promise<void> {
    console.log(`Generating link suggestions for ${siteId}`);
    await LinkOptimizerService.generateSuggestions(siteId);
}

export async function acceptLinkSuggestionActivity(siteId: string, suggestionId: string, anchorText: string): Promise<void> {
    console.log(`Accepting link suggestion ${suggestionId} for ${siteId}`);
    await LinkOptimizerService.acceptSuggestion(siteId, suggestionId, anchorText);
}
