import { client } from '../../clickhouse';

export interface LinkSuggestion {
    site_id: string;
    from_page_id: string;
    to_page_id: string;
    similarity: number;
    target_tspr: number;
    score: number;
    reason?: string;
}

export class ClickHouseLinkSuggestionStore {
    static async saveSuggestion(suggestion: LinkSuggestion) {
        if (!client) return;
        await client.insert({
            table: 'link_suggestions',
            values: [suggestion],
            format: 'JSONEachRow',
        });
    }

    static async getSuggestions(siteId: string, fromPageId: string, limit: number = 5) {
        if (!client) return [];
        const result = await client.query({
            query: `
        SELECT * FROM link_suggestions 
        WHERE site_id = {siteId:String} AND from_page_id = {fromPageId:String}
        ORDER BY score DESC
        LIMIT {limit:UInt32}
      `,
            query_params: { siteId, fromPageId, limit },
            format: 'JSONEachRow',
        });
        return await result.json();
    }

    static async getTopSuggestions(siteId: string, limit: number = 100) {
        if (!client) return [];
        const result = await client.query({
            query: `
        SELECT * FROM link_suggestions 
        WHERE site_id = {siteId:String}
        ORDER BY score DESC
        LIMIT {limit:UInt32}
      `,
            query_params: { siteId, limit },
            format: 'JSONEachRow',
        });
        return await result.json();
    }
}
