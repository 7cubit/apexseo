import { DataForSEOBase } from './base';

export class KeywordsService extends DataForSEOBase {

    /**
     * Get search volume for a list of keywords
     */
    async getSearchVolume(keywords: string[], location_code = 2840, language_code = "en") {
        const endpoint = "/keywords_data/google_ads/search_volume/live";
        const payload = [{
            keywords,
            location_code,
            language_code
        }];
        try {
            const data: any = await this.request(endpoint, payload);
            return data.tasks?.[0]?.result?.[0] || [];
        } catch (error) {
            console.error("Error fetching search volume:", error);
            throw error; // Re-throw the error after logging
        }
    }

    /**
     * Get keyword suggestions based on seed keywords
     */
    async getKeywordSuggestions(keywords: string[], location_code = 2840, language_code = "en") {
        const endpoint = "/keywords_data/google_ads/keywords_for_keywords/live";
        const payload = [{
            keywords,
            location_code,
            language_code,
            include_seed_keyword: true,
            include_serp_info: false,
            limit: 100
        }];
        try {
            const data: any = await this.request(endpoint, payload);
            return data.tasks?.[0]?.result?.[0]?.items || [];
        } catch (error) {
            console.error("Error fetching keyword suggestions:", error);
            throw error;
        }
    }

    /**
     * Get keywords for a specific domain (Competitor Analysis)
     */
    async getKeywordsForSite(target: string, location_code = 2840, language_code = "en") {
        const endpoint = "/keywords_data/google_ads/keywords_for_site/live";
        const payload = [{
            target,
            location_code,
            language_code,
            include_serp_info: false,
            limit: 100
        }];
        return this.request(endpoint, payload);
    }
}
