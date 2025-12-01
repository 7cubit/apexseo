import { getDriver } from '../lib/neo4j';
import { GraphRepository } from '../lib/neo4j/repositories/GraphRepository';
import * as dotenv from 'dotenv';

dotenv.config();

async function validateGraph() {
    console.log('Running graph integrity checks...');
    const driver = getDriver();
    if (!driver) {
        console.error('Neo4j driver not initialized');
        process.exit(1);
    }

    try {
        const result = await GraphRepository.validateIntegrity();
        if (result.valid) {
            console.log('✅ Graph integrity check passed.');
        } else {
            console.error('❌ Graph integrity check failed:');
            result.errors.forEach((err: string) => console.error(` - ${err}`));
            process.exit(1);
        }
    } catch (error) {
        console.error('Error running validation:', error);
        process.exit(1);
    } finally {
        await driver.close();
    }
}

validateGraph();
