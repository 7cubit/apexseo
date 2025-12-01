
import { btoa } from "buffer";

export class DataForSEOClient {
    private login: string;
    private pass: string;
    private baseUrl = "https://api.dataforseo.com/v3";

    constructor() {
        this.login = process.env.DATAFORSEO_LOGIN || "";
        this.pass = process.env.DATAFORSEO_PASSWORD || "";

        if (!this.login || !this.pass) {
            console.warn("DataForSEO credentials not found in environment variables.");
        }
    }

    private getAuthHeader() {
        return `Basic ${Buffer.from(`${this.login}:${this.pass}`).toString("base64")}`;
    }

    async getSearchVolume(keywords: string[]): Promise<any> {
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
        } catch (error) {
            console.error("Error fetching search volume:", error);
            throw error;
        }
    }

    async getSerpRank(keyword: string, siteUrl: string): Promise<{ rank: number; url: string } | null> {
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
            const items = data.tasks?.[0]?.result?.[0]?.items || [];

            // Find the rank for the specific site URL
            // We check if the item URL contains the siteUrl (simple check)
            // In a real scenario, we might need more robust URL matching
            const foundItem = items.find((item: any) => item.url && item.url.includes(siteUrl));

            if (foundItem) {
                return {
                    rank: foundItem.rank_group,
                    url: foundItem.url,
                };
            }

            return null; // Not found in top 100
        } catch (error) {
            console.error(`Error fetching SERP for ${keyword}:`, error);
            throw error;
        }
    }

    async getBacklinksSummary(targetUrl: string, limit: number = 100): Promise<any> {
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
        } catch (error) {
            console.error(`Error fetching backlinks summary for ${targetUrl}:`, error);
            throw error;
        }
    }

    async getBacklinks(targetUrl: string, limit: number = 100): Promise<any> {
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
        } catch (error) {
            console.error(`Error fetching backlinks for ${targetUrl}:`, error);
            throw error;
        }
    }
}
