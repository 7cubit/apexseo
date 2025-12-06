import { createClient } from '@clickhouse/client';
import { ContentBrief } from '../types';
import { v4 as uuidv4 } from 'uuid';

const client = createClient({
    url: process.env.CLICKHOUSE_URL,
    username: 'default',
    password: process.env.CLICKHOUSE_PASSWORD,
    database: process.env.CLICKHOUSE_DATABASE || 'default',
    request_timeout: 30000,
});

export async function queueContentTask(
    brief: ContentBrief,
    userId: string,
    clusterId: string,
    topicId: string
): Promise<string> {
    const taskId = uuidv4();

    // Ensure table exists (idempotent)
    // In production, schema migration handles this.
    // Table: content_production_queue

    try {
        await client.insert({
            table: 'content_production_queue',
            values: [{
                task_id: taskId,
                user_id: userId,
                cluster_id: clusterId,
                topic_id: topicId,
                brief_json: JSON.stringify(brief),
                status: 'PENDING',
                created_at: new Date().toISOString(), // ClickHouse handles ISO strings usually or use format
                priority: 'HIGH'
            }],
            format: 'JSONEachRow'
        });

        return taskId;
    } catch (error) {
        console.error("Failed to queue content task", error);
        throw error;
    }
}
