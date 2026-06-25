"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;
const client_1 = require("@clickhouse/client");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Force load env from root
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../../../.env') });
const CLICKHOUSE_URL = process.env.CLICKHOUSE_URL;
const CLICKHOUSE_USER = process.env.CLICKHOUSE_USER || 'default';
const CLICKHOUSE_PASSWORD = process.env.CLICKHOUSE_PASSWORD;
console.log("Initializing ClickHouse client...", { URL: !!CLICKHOUSE_URL, USER: !!CLICKHOUSE_USER, PASS: !!CLICKHOUSE_PASSWORD });
exports.client = CLICKHOUSE_URL
    ? (0, client_1.createClient)({
        url: CLICKHOUSE_URL,
        username: CLICKHOUSE_USER,
        password: CLICKHOUSE_PASSWORD || undefined,
        request_timeout: 30000,
    })
    : null;
