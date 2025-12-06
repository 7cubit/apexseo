export interface DataForSEOConfig {
    login: string;
    password: string;
    baseUrl?: string;
}

import { MOCK_KEYWORDS, MOCK_SERP, MOCK_BACKLINKS_SUMMARY, MOCK_BACKLINKS_LIST, MOCK_ONPAGE } from './mocks';

export class DataForSEOBase {
    protected config: DataForSEOConfig;
    protected baseUrl: string;

    constructor(config: DataForSEOConfig) {
        this.config = config;
        this.baseUrl = config.baseUrl || "https://api.dataforseo.com/v3";
    }

    protected getAuthHeader(): string {
        return `Basic ${Buffer.from(`${this.config.login}:${this.config.password}`).toString("base64")}`;
    }

    protected async request<T>(endpoint: string, payload: any): Promise<any> {
        // MOCK MODE: If no credentials or explicit mock, return mock data
        if (!this.config.login || !this.config.password || this.config.login === 'mock') {
            console.log(`[DataForSEO] Mocking request to ${endpoint}`);
            await new Promise(resolve => setTimeout(resolve, 800)); // Simulate latency

            if (endpoint.includes('search_volume')) {
                return { tasks: [{ result: [MOCK_KEYWORDS[0]] }] };
            }
            if (endpoint.includes('keywords_for_keywords')) {
                return { tasks: [{ result: [{ items: MOCK_KEYWORDS }] }] };
            }
            if (endpoint.includes('serp')) {
                return { tasks: [{ result: [{ items: MOCK_SERP }] }] };
            }
            if (endpoint.includes('backlinks/summary')) {
                return { tasks: [{ result: [MOCK_BACKLINKS_SUMMARY] }] };
            }
            if (endpoint.includes('backlinks/backlinks')) {
                return { tasks: [{ result: [{ items: MOCK_BACKLINKS_LIST }] }] };
            }
            if (endpoint.includes('instant_pages')) {
                return { tasks: [{ result: [MOCK_ONPAGE] }] };
            }
            return {};
        }

        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method: "POST",
                headers: {
                    Authorization: this.getAuthHeader(),
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`DataForSEO API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            if (data.status_code && data.status_code >= 400) {
                throw new Error(`DataForSEO Task Error: ${data.status_message}`);
            }

            return data;
        } catch (error) {
            console.error(`DataForSEO Request Failed [${endpoint}]:`, error);
            throw error;
        }
    }
}
