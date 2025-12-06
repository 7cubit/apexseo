import { DataForSEOBase } from './base';

export class SerpService extends DataForSEOBase {

    /**
     * Get Google Organic SERP results
     */
    async getOrganic(keyword: string, location_code = 2840, language_code = "en", depth = 100) {
        const endpoint = "/serp/google/organic/live/advanced";
        const payload = [{
            keyword,
            location_code,
            language_code,
            depth
        }];
        return this.request(endpoint, payload);
    }

    /**
     * Get Google Maps SERP results
     */
    async getMaps(keyword: string, location_code = 2840, language_code = "en") {
        const endpoint = "/serp/google/maps/live/advanced";
        const payload = [{
            keyword,
            location_code,
            language_code
        }];
        return this.request(endpoint, payload);
    }

    /**
     * Get Google News SERP results
     */
    async getNews(keyword: string, location_code = 2840, language_code = "en") {
        const endpoint = "/serp/google/news/live/advanced";
        const payload = [{
            keyword,
            location_code,
            language_code
        }];
        return this.request(endpoint, payload);
    }
}
