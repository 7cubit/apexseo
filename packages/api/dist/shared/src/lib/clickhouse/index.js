"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initClickHouse = initClickHouse;
exports.insertEmbedding = insertEmbedding;
const client_1 = require("./client");
const ClickHouseAlertRepository_1 = require("./repositories/ClickHouseAlertRepository");
const ClickHousePageRepository_1 = require("./repositories/ClickHousePageRepository");
const ClickHouseProjectUserRepository_1 = require("./repositories/ClickHouseProjectUserRepository");
const ClickHouseScoreRepository_1 = require("./repositories/ClickHouseScoreRepository");
__exportStar(require("./client"), exports);
async function initClickHouse() {
    if (!client_1.client) {
        console.warn("ClickHouse credentials missing. Skipping initialization.");
        return;
    }
    const query = `
    CREATE TABLE IF NOT EXISTS page_embeddings(
    id String,
    embedding Array(Float32)
) ENGINE = MergeTree()
    ORDER BY id
  `;
    try {
        console.log("Initializing page_embeddings...");
        await client_1.client.query({
            query: query,
            format: 'JSONEachRow',
        });
        console.log("ClickHouse table initialized.");
        console.log("Initializing alerts table...", !!ClickHouseAlertRepository_1.ClickHouseAlertRepository);
        await ClickHouseAlertRepository_1.ClickHouseAlertRepository.createTable();
        console.log("ClickHouse alerts table initialized.");
        console.log("Initializing pages table...", !!ClickHousePageRepository_1.ClickHousePageRepository);
        await ClickHousePageRepository_1.ClickHousePageRepository.createTable();
        console.log("ClickHouse pages table initialized.");
        console.log("Initializing project_users table...", !!ClickHouseProjectUserRepository_1.ClickHouseProjectUserRepository);
        await ClickHouseProjectUserRepository_1.ClickHouseProjectUserRepository.createTable();
        console.log("ClickHouse project_users table initialized.");
        console.log("Initializing score_history table...", !!ClickHouseScoreRepository_1.ClickHouseScoreRepository);
        await ClickHouseScoreRepository_1.ClickHouseScoreRepository.createTable();
        console.log("ClickHouse score_history table initialized.");
    }
    catch (error) {
        console.error("Failed to initialize ClickHouse:", JSON.stringify(error, null, 2));
    }
}
async function insertEmbedding(id, embedding) {
    if (!client_1.client)
        return;
    try {
        await client_1.client.insert({
            table: 'page_embeddings',
            values: [
                { id: id, embedding: embedding }
            ],
            format: 'JSONEachRow',
        });
    }
    catch (error) {
        console.error(`Failed to insert embedding for ${id}: `, error);
    }
}
__exportStar(require("./repositories/ClickHouseAlertRepository"), exports);
__exportStar(require("./repositories/ClickHousePageRepository"), exports);
__exportStar(require("./repositories/ClickHouseProjectUserRepository"), exports);
__exportStar(require("./repositories/ClickHouseScoreRepository"), exports);
