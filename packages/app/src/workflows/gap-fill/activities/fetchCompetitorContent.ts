import { CompetitorContent } from '../types';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function fetchCompetitorContent(
    missingKeywords: string[],
    competitorDomain: string
): Promise<CompetitorContent[]> {
    // Limit to top 3 keywords to save resources/time
    const targetKeywords = missingKeywords.slice(0, 3);
    const results: CompetitorContent[] = [];

    for (const keyword of targetKeywords) {
        try {
            // In production, we would use a SERP API (like DataForSEO) to find the exact URL ranking for this keyword.
            // For this implementation, we'll simulate a URL structure or use a placeholder.
            // Let's assume we have a way to get the URL, or we construct a likely one.
            const slug = keyword.toLowerCase().replace(/ /g, '-');
            const url = `https://${competitorDomain}/${slug}`;

            // Mock fetching for now to avoid external calls failing in this environment
            // unless we have a real scraping service.
            // We'll simulate a successful fetch with "Lorem Ipsum" content relevant to the keyword.

            // SIMULATED FETCH
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

            const simulatedContent = `
                <h1>Guide to ${keyword}</h1>
                <p>This is a comprehensive guide about ${keyword}. It covers all the important aspects including pricing, location, and tips.</p>
                <h2>Key Features</h2>
                <ul>
                    <li>Feature 1 of ${keyword}</li>
                    <li>Feature 2 of ${keyword}</li>
                </ul>
            `;

            const $ = cheerio.load(simulatedContent);
            const title = $('h1').text() || keyword;
            const text = $('body').text().substring(0, 1000); // Extract text

            results.push({
                url,
                keyword,
                title,
                content_snippet: text.trim()
            });

        } catch (error) {
            console.warn(`Failed to fetch content for ${keyword} from ${competitorDomain}`, error);
            // Continue to next keyword
        }
    }

    return results;
}
