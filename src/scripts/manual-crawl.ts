import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
import { crawlSite } from "../lib/crawler";

async function main() {
    console.log("Starting manual crawl for junketjapan.com...");
    try {
        await crawlSite("https://junketjapan.com", "junket-japan");
        console.log("Crawl completed successfully.");
    } catch (error) {
        console.error("Crawl failed:", error);
    }
    process.exit(0);
}

main();
