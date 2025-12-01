import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
import { ClickHouseClaimStore } from '../lib/clickhouse/repositories/ClickHouseClaimStore';

async function main() {
    try {
        console.log("Initializing claims table...");
        await ClickHouseClaimStore.initialize();
        console.log("Done.");
    } catch (e) {
        console.error(e);
    }
}

main();
