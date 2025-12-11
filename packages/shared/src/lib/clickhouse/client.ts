import { createClient } from '@clickhouse/client';
import dotenv from 'dotenv';
import path from 'path';

// Force load env from root
dotenv.config({ path: path.resolve(__dirname, '../../../../../.env') });

const CLICKHOUSE_URL = process.env.CLICKHOUSE_URL;
const CLICKHOUSE_USER = process.env.CLICKHOUSE_USER || 'default';
const CLICKHOUSE_PASSWORD = process.env.CLICKHOUSE_PASSWORD;

console.log("Initializing ClickHouse client...", { URL: !!CLICKHOUSE_URL, USER: !!CLICKHOUSE_USER, PASS: !!CLICKHOUSE_PASSWORD });

export const client = CLICKHOUSE_URL
    ? createClient({
        url: CLICKHOUSE_URL,
        username: CLICKHOUSE_USER,
        password: CLICKHOUSE_PASSWORD || undefined,
        request_timeout: 30000,
    })
    : null;

console.log("ClickHouse client initialized. Client instance:", !!client);
