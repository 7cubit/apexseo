"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataForSEOClient = void 0;
class DataForSEOClient {
    constructor() {
        this.baseUrl = "https://api.dataforseo.com/v3";
        this.login = process.env.DATAFORSEO_LOGIN || "";
        this.pass = process.env.DATAFORSEO_PASSWORD || "";
        if (!this.login || !this.pass) {
            console.warn("DataForSEO credentials not found in environment variables.");
        }
    }
    getAuthHeader() {
        return `Basic ${Buffer.from(`${this.login}:${this.pass}`).toString("base64")}`;
    }
    async getSearchVolume(keywords) {
        const endpoint = `${this.baseUrl}/keywords_data/google_ads/search_volume/live`;
        const payload = [
            {
                keywords: keywords,
                location_code: 2840, // US, default
                language_code: "en", // English, default
            },
        ];
        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    Authorization: this.getAuthHeader(),
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                throw new Error(`DataForSEO API error: ${response.statusText}`);
            }
            const data = await response.json();
            return data;
        }
        catch (error) {
            console.error("Error fetching search volume:", error);
            throw error;
        }
    }
    async getSerpRank(keyword, siteUrl) {
        var _a, _b, _c, _d;
        const endpoint = `${this.baseUrl}/serp/google/organic/live/advanced`;
        const payload = [
            {
                keyword: keyword,
                location_code: 2840, // US
                language_code: "en",
                depth: 100,
            },
        ];
        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    Authorization: this.getAuthHeader(),
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                throw new Error(`DataForSEO API error: ${response.statusText}`);
            }
            const data = await response.json();
            const items = ((_d = (_c = (_b = (_a = data.tasks) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.result) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.items) || [];
            // Find the rank for the specific site URL
            // We check if the item URL contains the siteUrl (simple check)
            // In a real scenario, we might need more robust URL matching
            const foundItem = items.find((item) => item.url && item.url.includes(siteUrl));
            if (foundItem) {
                return {
                    rank: foundItem.rank_group,
                    url: foundItem.url,
                };
            }
            return null; // Not found in top 100
        }
        catch (error) {
            console.error(`Error fetching SERP for ${keyword}:`, error);
            throw error;
        }
    }
    async getBacklinksSummary(targetUrl, limit = 100) {
        const endpoint = `${this.baseUrl}/backlinks/summary/live`;
        const payload = [
            {
                target: targetUrl,
                limit: limit,
                internal_list_limit: 10,
                include_subdomains: true,
                backlinks_status_type: "all"
            }
        ];
        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    Authorization: this.getAuthHeader(),
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                throw new Error(`DataForSEO API error: ${response.statusText}`);
            }
            const data = await response.json();
            return data;
        }
        catch (error) {
            console.error(`Error fetching backlinks summary for ${targetUrl}:`, error);
            throw error;
        }
    }
    async getBacklinks(targetUrl, limit = 100) {
        const endpoint = `${this.baseUrl}/backlinks/backlinks/live`;
        const payload = [
            {
                target: targetUrl,
                limit: limit,
                mode: "as_is",
                include_subdomains: true,
                backlinks_status_type: "all"
            }
        ];
        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    Authorization: this.getAuthHeader(),
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                throw new Error(`DataForSEO API error: ${response.statusText}`);
            }
            const data = await response.json();
            return data;
        }
        catch (error) {
            console.error(`Error fetching backlinks for ${targetUrl}:`, error);
            throw error;
        }
    }
    async getKeywordSuggestions(seedKeyword, location = 'United States') {
        var _a, _b, _c, _d;
        // DataForSEO Keywords Suggestions API
        const endpoint = `${this.baseUrl}/keywords_data/google_ads/keywords_for_keywords/live`;
        const payload = [
            {
                keywords: [seedKeyword],
                location_name: location,
                language_code: "en",
                include_seed_keyword: true,
                include_serp_info: false,
                limit: 100
            }
        ];
        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    Authorization: this.getAuthHeader(),
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                throw new Error(`DataForSEO API error: ${response.statusText}`);
            }
            const data = await response.json();
            const items = ((_d = (_c = (_b = (_a = data.tasks) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.result) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.items) || [];
            return items.map((item) => item.keyword);
        }
        catch (error) {
            console.error(`Error fetching keyword suggestions for ${seedKeyword}:`, error);
            throw error;
        }
    }
}
exports.DataForSEOClient = DataForSEOClient;
