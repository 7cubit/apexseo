import { client } from '../../clickhouse';

export interface CrawlLog {
    url: string;
    html: string;
    timestamp: number;
    status: number;
}

export class ClickHouseCrawlLogRepository {
    static async createTable() {
        if (!client) return;
        await client.command({
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

    static async insertLog(log: CrawlLog) {
        if (!client) return;
        await client.insert({
            table: 'raw_crawl_log',
            values: [log],
            format: 'JSONEachRow',
        });
    }
}
