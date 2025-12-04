import { client } from '../../clickhouse';

export interface LinkSuggestion {
    site_id: string;
    source_page_id: string;
    target_page_id: string;
    source_url: string;
    target_url: string;
    similarity_score: number;
    tspr_diff: number;
    cluster_id: string;
    suggested_anchor: string;
    reason: string;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
}

export class ClickHouseLinkSuggestionRepository {
    static async createTable() {
        if (!client) return;

        await client.command({
            query: `
                CREATE TABLE IF NOT EXISTS link_suggestions (
                    site_id String,
                    source_page_id String,
                    target_page_id String,
                    source_url String,
                    target_url String,
                    similarity_score Float32,
                    tspr_diff Float32,
                    cluster_id String,
                    suggested_anchor String,
                    reason String,
                    status String,
                    created_at DateTime DEFAULT now()
                ) ENGINE = MergeTree()
                ORDER BY (site_id, similarity_score)
            `
        });
    }

    static async saveSuggestions(suggestions: LinkSuggestion[]) {
        if (!client || suggestions.length === 0) return;

        await client.insert({
            table: 'link_suggestions',
            values: suggestions,
            format: 'JSONEachRow',
        });
    }

    static async getSuggestions(siteId: string, status: string = 'pending') {
        if (!client) return [];

        const result = await client.query({
            query: `
                SELECT * FROM link_suggestions 
                WHERE site_id = {siteId:String} AND status = {status:String}
                ORDER BY similarity_score DESC
                LIMIT 100
            `,
            query_params: { siteId, status },
            format: 'JSONEachRow',
        });
        return await result.json();
    }

    static async updateStatus(siteId: string, sourceId: string, targetId: string, status: string) {
        if (!client) return;

        // Note: Mutations are heavy in ClickHouse.
        await client.command({
            query: `
                ALTER TABLE link_suggestions 
                UPDATE status = {status:String} 
                WHERE site_id = {siteId:String} 
                AND source_page_id = {sourceId:String} 
                AND target_page_id = {targetId:String}
            `,
            query_params: { siteId, sourceId, targetId, status }
        });
    }
}
