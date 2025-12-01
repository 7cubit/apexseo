import { client } from '../../clickhouse';

export interface Backlink {
    site_id: string;
    referring_domain: string;
    backlink_url: string;
    target_url: string;
    anchor_text: string;
    is_dofollow: boolean;
    spam_score: number;
    date_found: string; // YYYY-MM-DD
    domain_relevance: number;
}

export class ClickHouseBacklinkRepository {
    static async createTable() {
        if (!client) return;

        const query = `
        CREATE TABLE IF NOT EXISTS backlinks (
            site_id String,
            referring_domain String,
            backlink_url String,
            target_url String,
            anchor_text String,
            is_dofollow UInt8,
            spam_score Float32,
            date_found Date,
            domain_relevance Float32
        ) ENGINE = MergeTree()
        ORDER BY (site_id, referring_domain)
        `;

        try {
            await client.query({
                query: query,
                format: 'JSONEachRow',
            });
            console.log("ClickHouse backlinks table initialized.");
        } catch (error) {
            console.error("Failed to initialize backlinks table:", error);
        }
    }

    static async insertBacklinks(backlinks: Backlink[]) {
        if (!client || backlinks.length === 0) return;

        try {
            // Convert boolean to UInt8 for ClickHouse
            const values = backlinks.map(b => ({
                ...b,
                is_dofollow: b.is_dofollow ? 1 : 0
            }));

            await client.insert({
                table: 'backlinks',
                values: values,
                format: 'JSONEachRow',
            });
        } catch (error) {
            console.error("Error inserting backlinks:", error);
            throw error;
        }
    }

    static async getBacklinks(siteId: string, limit: number = 100) {
        if (!client) return [];

        const query = `
            SELECT * FROM backlinks 
            WHERE site_id = {siteId:String}
            ORDER BY date_found DESC
            LIMIT {limit:UInt32}
        `;

        try {
            const result = await client.query({
                query: query,
                query_params: { siteId, limit },
                format: 'JSONEachRow',
            });
            return await result.json();
        } catch (error) {
            console.error("Error fetching backlinks:", error);
            return [];
        }
    }

    static async getReferringDomains(siteId: string) {
        if (!client) return [];

        const query = `
            SELECT 
                referring_domain,
                count() as backlink_count,
                avg(spam_score) as avg_spam_score,
                avg(domain_relevance) as avg_relevance
            FROM backlinks
            WHERE site_id = {siteId:String}
            GROUP BY referring_domain
            ORDER BY backlink_count DESC
            LIMIT 50
        `;

        try {
            const result = await client.query({
                query: query,
                query_params: { siteId },
                format: 'JSONEachRow',
            });
            return await result.json();
        } catch (error) {
            console.error("Error fetching referring domains:", error);
            return [];
        }
    }

    static async getStats(siteId: string) {
        if (!client) return null;

        const query = `
            SELECT 
                uniq(referring_domain) as total_domains,
                count() as total_backlinks,
                sum(is_dofollow) as dofollow_count,
                avg(domain_relevance) as avg_relevance,
                avg(spam_score) as avg_spam_score
            FROM backlinks
            WHERE site_id = {siteId:String}
        `;

        try {
            const result = await client.query({
                query: query,
                query_params: { siteId },
                format: 'JSONEachRow',
            });
            const rows = await result.json();
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error("Error fetching backlink stats:", error);
            return null;
        }
    }
}
