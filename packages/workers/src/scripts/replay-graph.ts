import { client, GraphRepository, getDriver } from '@apexseo/shared';
import * as cheerio from 'cheerio';
import * as dotenv from 'dotenv';
import { URL } from 'url';

dotenv.config();

async function replayGraph() {
    console.log('Starting graph replay from ClickHouse raw_crawl_log...');

    if (!client) {
        console.error('ClickHouse client not initialized');
        process.exit(1);
    }

    // Increase timeout for this script
    // Note: client config is global, but we can try to pass settings in query if supported or just retry.
    // The error is socket timeout.


    try {
        // Stream rows from raw_crawl_log
        // We use a cursor or offset/limit. For simplicity, let's process in batches.
        const batchSize = 100;
        let offset = 0;
        let hasMore = true;

        while (hasMore) {
            console.log(`Processing batch at offset ${offset}...`);
            const result = await client.query({
                query: `SELECT url, html, timestamp FROM raw_crawl_log ORDER BY timestamp ASC LIMIT ${batchSize} OFFSET ${offset}`,
                format: 'JSONEachRow',
            });
            const rows: any[] = await result.json();

            if (rows.length === 0) {
                hasMore = false;
                break;
            }

            for (const row of rows) {
                try {
                    const { url, html } = row;
                    const $ = cheerio.load(html);
                    const title = $("title").text();
                    const h1 = $("h1").first().text();
                    const canonicalUrl = $('link[rel="canonical"]').attr('href');
                    const siteId = new URL(url).hostname; // Derive siteId from URL

                    const links: { url: string, text: string, isInternal: boolean, rel?: string }[] = [];
                    $("a[href]").each((_, el) => {
                        const href = $(el).attr("href");
                        const linkText = $(el).text().trim().substring(0, 50);
                        const rel = $(el).attr("rel");

                        if (href) {
                            try {
                                const absoluteUrl = new URL(href, url).href;
                                const isInternal = absoluteUrl.includes(siteId) || (new URL(absoluteUrl).hostname === new URL(url).hostname);
                                links.push({
                                    url: absoluteUrl,
                                    text: linkText,
                                    isInternal,
                                    rel
                                });
                            } catch (e) { }
                        }
                    });

                    await GraphRepository.saveGraphData({
                        url,
                        title,
                        h1,
                        canonicalUrl: canonicalUrl ? new URL(canonicalUrl, url).href : undefined,
                        links,
                        siteId
                    });

                    process.stdout.write('.');
                } catch (err) {
                    console.error(`\nFailed to process ${row.url}`, err);
                }
            }

            console.log('\nBatch complete.');
            offset += batchSize;
        }

        console.log('Graph replay completed.');
    } catch (error) {
        console.error('Error during replay:', error);
        process.exit(1);
    } finally {
        // Close connections
        const driver = getDriver();
        if (driver) {
            await driver.close();
        }
        await client.close();
        process.exit(0);
    }
}

replayGraph();
