import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
import { GraphAlgoRepository } from '../lib/neo4j/repositories/GraphAlgoRepository';

async function main() {
    const projectId = 'junket-japan';
    console.log(`Debugging TSPR for ${projectId}...`);
    try {
        console.log("1. Getting Pillar Pages...");
        const pillars = await GraphAlgoRepository.getPillarPages(projectId);
        console.log(`Found ${pillars.length} pillars:`, pillars);

        console.log("2. Running PageRank...");
        await GraphAlgoRepository.runPageRank(projectId);
        console.log("PageRank complete.");

        console.log("3. Running TSPR...");
        await GraphAlgoRepository.runTSPR(projectId, pillars);
        console.log("TSPR complete.");

    } catch (error) {
        console.error("TSPR Failed:", error);
    }
    process.exit(0);
}

main();
