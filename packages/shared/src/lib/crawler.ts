import * as cheerio from "cheerio";
import { PageRepository, savePageWithLinks } from "./neo4j/repositories/PageRepository";

// Simple in-memory status tracker
export const crawlStatus: Record<string, { pages: number, total: number, status: string }> = {};

export async function crawlSite(startUrl: string, projectId: string) {
    // const projectId = "test-project"; // Removed hardcoded ID
    const maxPages = 100;
    const visited = new Set<string>();
    const queue = [startUrl];

    crawlStatus[startUrl] = { pages: 0, total: 0, status: "Crawling..." };

    while (queue.length > 0 && visited.size < maxPages) {
        const url = queue.shift()!;
        if (visited.has(url)) continue;

        visited.add(url);
        crawlStatus[startUrl].pages = visited.size;
        crawlStatus[startUrl].total = queue.length + visited.size;

        try {
            const response = await fetch(url, { headers: { "User-Agent": "ApexSEO-Crawler/1.0" } });
            if (!response.ok) continue;

            const html = await response.text();
            const $ = cheerio.load(html);
            const title = $("title").text();
            const text = $("body").text().replace(/\s+/g, " ").trim();
            const wordCount = text.split(" ").length;

            const internalLinks: { url: string, text: string }[] = [];
            $("a[href]").each((_, el) => {
                const href = $(el).attr("href");
                const text = $(el).text().trim().substring(0, 50); // Limit text length
                if (href && (href.startsWith("/") || href.startsWith(startUrl))) {
                    // Normalize and add to queue
                    try {
                        const absoluteUrl = new URL(href, startUrl).href;
                        if (!visited.has(absoluteUrl)) {
                            queue.push(absoluteUrl);
                            internalLinks.push({ url: absoluteUrl, text });
                        }
                    } catch (e) {
                        // Ignore invalid URLs
                    }
                }
            });

            // Save to Neo4j
            try {
                await savePageWithLinks(projectId, { url, title, text, wordCount, internalLinks });
            } catch (e) {
                console.warn("Failed to save to Neo4j", e);
            }

        } catch (error) {
            console.error(`Failed to crawl ${url}`, error);
        }
    }

    crawlStatus[startUrl].status = "Completed";
}
