"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClickHouseCrawlLogRepository = void 0;
const clickhouse_1 = require("../../clickhouse");
class ClickHouseCrawlLogRepository {
    static async createTable() {
        if (!clickhouse_1.client)
            return;
        await clickhouse_1.client.command({
            query: `
                CREATE TABLE IF NOT EXISTS raw_crawl_log (
                    url String,
                    html String,
                    timestamp DateTime64(3),
                    status UInt16
                ) ENGINE = MergeTree()
                ORDER BY timestamp
            `
        });
    }
    static async insertLog(log) {
        if (!clickhouse_1.client)
            return;
        await clickhouse_1.client.insert({
            table: 'raw_crawl_log',
            values: [log],
            format: 'JSONEachRow',
        });
    }
}
exports.ClickHouseCrawlLogRepository = ClickHouseCrawlLogRepository;
