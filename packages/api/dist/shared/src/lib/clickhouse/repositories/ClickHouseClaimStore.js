"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClickHouseClaimStore = void 0;
const clickhouse_1 = require("../../clickhouse");
class ClickHouseClaimStore {
    static async createTable() {
        if (!clickhouse_1.client)
            return;
        await clickhouse_1.client.command({
            query: `
                CREATE TABLE IF NOT EXISTS claims (
                    site_id String,
                    page_id String,
                    claim_id String,
                    claim_text String,
                    risk_score Float32,
                    verification_status String,
                    source String,
                    embedding Array(Float32),
                    created_at DateTime DEFAULT now()
                ) ENGINE = MergeTree()
                ORDER BY (site_id, page_id)
            `
        });
    }
    static async saveClaim(claim) {
        if (!clickhouse_1.client)
            return;
        await clickhouse_1.client.insert({
            table: 'claims',
            values: [claim],
            format: 'JSONEachRow',
        });
    }
    static async getClaimsByPage(pageId) {
        if (!clickhouse_1.client)
            return [];
        const result = await clickhouse_1.client.query({
            query: `SELECT * FROM claims WHERE page_id = {pageId:String}`,
            query_params: { pageId },
            format: 'JSONEachRow',
        });
        return await result.json();
    }
}
exports.ClickHouseClaimStore = ClickHouseClaimStore;
