"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;
exports.initClickHouse = initClickHouse;
exports.insertEmbedding = insertEmbedding;
const client_1 = require("@clickhouse/client");
const CLICKHOUSE_URL = process.env.CLICKHOUSE_URL;
const CLICKHOUSE_USER = process.env.CLICKHOUSE_USER || 'default';
const CLICKHOUSE_PASSWORD = process.env.CLICKHOUSE_PASSWORD;
console.log("Initializing ClickHouse client...", { URL: !!CLICKHOUSE_URL, USER: !!CLICKHOUSE_USER, PASS: !!CLICKHOUSE_PASSWORD });
exports.client = (CLICKHOUSE_URL && CLICKHOUSE_PASSWORD)
    ? (0, client_1.createClient)({
        url: CLICKHOUSE_URL,
        username: CLICKHOUSE_USER,
        password: CLICKHOUSE_PASSWORD,
        request_timeout: 30000,
    })
    : null;
async function initClickHouse() {
    if (!exports.client) {
        console.warn("ClickHouse credentials missing. Skipping initialization.");
        return;
    }
    const query = `
    CREATE TABLE IF NOT EXISTS page_embeddings (
      id String,
      embedding Array(Float32)
    ) ENGINE = MergeTree()
    ORDER BY id
  `;
    try {
        await exports.client.query({
            query: query,
            format: 'JSONEachRow',
        });
        console.log("ClickHouse table initialized.");
    }
    catch (error) {
        console.error("Failed to initialize ClickHouse:", error);
    }
}
async function insertEmbedding(id, embedding) {
    if (!exports.client)
        return;
    try {
        await exports.client.insert({
            table: 'page_embeddings',
            values: [
                { id: id, embedding: embedding }
            ],
            format: 'JSONEachRow',
        });
    }
    catch (error) {
        console.error(`Failed to insert embedding for ${id}:`, error);
    }
}
