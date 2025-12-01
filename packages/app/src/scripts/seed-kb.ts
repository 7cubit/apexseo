import { ClickHouseClaimStore, KBEntry } from '../lib/clickhouse/repositories/ClickHouseClaimStore';
import { generateEmbedding } from '../lib/embeddings';

const mockArticles = [
    {
        title: "SEO Basics",
        text: "Search Engine Optimization (SEO) is the process of improving the quality and quantity of website traffic to a website or a web page from search engines. SEO targets unpaid traffic (known as 'natural' or 'organic' results) rather than direct traffic or paid traffic.",
        source: "Wikipedia"
    },
    {
        title: "PageRank",
        text: "PageRank (PR) is an algorithm used by Google Search to rank web pages in their search engine results. PageRank was named after Larry Page, one of the founders of Google. PageRank is a way of measuring the importance of website pages.",
        source: "Wikipedia"
    },
    {
        title: "Backlink",
        text: "A backlink is a link from some other website (the referrer) to that web resource (the referent). A web resource may be (for example) a website, web page, or web directory. A backlink is a reference comparable to a citation.",
        source: "Wikipedia"
    },
    {
        title: "Keyword Stuffing",
        text: "Keyword stuffing is a search engine optimization (SEO) technique, considered webspam or spamdexing, in which keywords are loaded into a web page's meta tags, visible content, or backlink anchor text in an attempt to gain an unfair rank advantage in search engines.",
        source: "Wikipedia"
    },
    {
        title: "Meta Tags",
        text: "Meta elements are tags used in HTML and XHTML documents to provide structured metadata about a Web page. They are part of a web page's head section. Multiple Meta elements with different attributes can be used on the same page.",
        source: "Wikipedia"
    }
];

async function seedKB() {
    console.log("Initializing KB...");
    await ClickHouseClaimStore.initialize();

    console.log("Seeding KB entries...");
    for (const article of mockArticles) {
        const embedding = await generateEmbedding(article.text);
        const entry: KBEntry = {
            id: Buffer.from(article.title).toString('base64'),
            title: article.title,
            text: article.text,
            embedding: embedding,
            source: article.source
        };
        await ClickHouseClaimStore.saveKBEntry(entry);
        console.log(`Saved: ${article.title}`);
    }
    console.log("KB Seeding Complete.");
}

seedKB().catch(console.error);
