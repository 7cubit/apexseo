import { GraphRepository, GraphPageData } from '@apexseo/shared';
import { logger } from '@apexseo/shared';

export async function graphWriterActivity(data: GraphPageData): Promise<void> {
    logger.info(`GraphWriter: Persisting graph data for ${data.url}`);
    try {
        await GraphRepository.saveGraphData(data);
        logger.info(`GraphWriter: Successfully saved ${data.url}`);
    } catch (error) {
        logger.error(`GraphWriter: Failed to save ${data.url}`, { error });
        throw error;
    }
}
