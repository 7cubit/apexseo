export const MOCK_KEYWORDS = [
    { keyword: "seo tools", search_volume: 49500, cpc: 2.5, competition: 0.8, trend: [40, 45, 50, 48, 52, 49] },
    { keyword: "best seo software", search_volume: 12100, cpc: 5.2, competition: 0.9, trend: [10, 12, 11, 13, 15, 14] },
    { keyword: "keyword research tool", search_volume: 22000, cpc: 1.8, competition: 0.6, trend: [20, 22, 25, 24, 26, 28] },
    { keyword: "backlink checker", search_volume: 18000, cpc: 1.5, competition: 0.5, trend: [15, 16, 18, 17, 19, 20] },
    { keyword: "site audit tool", search_volume: 8100, cpc: 3.0, competition: 0.7, trend: [8, 9, 8, 10, 11, 10] },
];

export const MOCK_SERP = [
    { rank_group: 1, type: "organic", title: "15 Best SEO Tools for 2024 (Free & Paid)", url: "https://ahrefs.com/blog/free-seo-tools/", description: "A curated list of the best free and paid SEO tools for keyword research, link building, and more." },
    { rank_group: 2, type: "organic", title: "The 28 Best SEO Tools (Tried & Tested)", url: "https://backlinko.com/seo-tools", description: "I've tested over 200 SEO tools. Here are the 28 best ones that actually work." },
    { rank_group: 3, type: "organic", title: "Best SEO Software: Top Rated Tools", url: "https://moz.com/free-seo-tools", description: "Explore the top-rated SEO software and tools to help you rank higher in search results." },
];

export const MOCK_BACKLINKS_SUMMARY = {
    total_backlinks: 12500,
    referring_domains: 850,
    domain_rank: 45
};

export const MOCK_BACKLINKS_LIST = [
    { url_from: "https://techcrunch.com/2024/01/seo-trends", url_to: "https://example.com", anchor: "best seo platform", rank: 85, first_seen: "2024-01-15" },
    { url_from: "https://searchengineland.com/guide", url_to: "https://example.com/tools", anchor: "click here", rank: 78, first_seen: "2024-02-01" },
    { url_from: "https://neilpatel.com/blog", url_to: "https://example.com", anchor: "ApexSEO", rank: 72, first_seen: "2024-02-20" },
];

export const MOCK_ONPAGE = {
    checks: {
        title: { valid: true, value: "Example Domain" },
        description: { valid: false, value: "" },
        h1: { valid: true, value: "Example Domain" },
    },
    scores: {
        performance: 95,
        accessibility: 88,
        best_practices: 92,
        seo: 85
    }
};
