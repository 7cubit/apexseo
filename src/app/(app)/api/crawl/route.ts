import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json({ error: "URL is required" }, { status: 400 });
        }

        // Basic validation for example.com to ensure we don't spam arbitrary sites during this demo
        // In a real app, we'd have more robust crawling logic (puppeteer, etc.)
        // For this demo, we'll use fetch to get the HTML.

        console.log(`Crawling URL: ${url}`);

        const response = await fetch(url, {
            headers: {
                "User-Agent": "ApexSEO-Crawler/1.0",
            },
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: `Failed to fetch URL: ${response.statusText}` },
                { status: response.status }
            );
        }

        const html = await response.text();

        return NextResponse.json({
            url,
            status: "success",
            html: html.substring(0, 50000), // Limit payload size
            crawledAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Crawl Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
