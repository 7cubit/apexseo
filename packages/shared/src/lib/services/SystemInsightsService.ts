import { getDriver, DATABASE } from '../neo4j';
import { client } from '../clickhouse';
import { createTemporalClient } from '../temporal';

export interface Neo4jStats {
    nodes: number;
    relationships: number;
    labels: string[];
    isolatedNodes: number;
}

export interface ClickHouseStats {
    storageBytes: number;
    rowCount: number;
    slowQueries: number;
}

export interface TemporalStats {
    runningWorkflows: number;
    failedWorkflows: number;
}

export class SystemInsightsService {
    static async getNeo4jStats(): Promise<Neo4jStats> {
        const driver = getDriver();
        if (!driver) return { nodes: 0, relationships: 0, labels: [], isolatedNodes: 0 };

        const session = driver.session({ database: DATABASE });
        try {
            const result = await session.run(`
                CALL {
                    MATCH (n) RETURN count(n) as nodes
                }
                CALL {
                    MATCH ()-[r]->() RETURN count(r) as relationships
                }
                CALL {
                    MATCH (n) WHERE size(labels(n)) > 0 RETURN collect(distinct labels(n)[0]) as labels
                }
                CALL {
                    MATCH (n) WHERE NOT (n)--() RETURN count(n) as isolatedNodes
                }
                RETURN nodes, relationships, labels, isolatedNodes
            `);

            const record = result.records[0];
            return {
                nodes: record.get('nodes').toNumber(),
                relationships: record.get('relationships').toNumber(),
                labels: record.get('labels'),
                isolatedNodes: record.get('isolatedNodes').toNumber()
            };
        } catch (error) {
            console.error('Failed to get Neo4j stats:', error);
            return { nodes: 0, relationships: 0, labels: [], isolatedNodes: 0 };
        } finally {
            await session.close();
        }
    }

    static async getClickHouseStats(): Promise<ClickHouseStats> {
        if (!client) return { storageBytes: 0, rowCount: 0, slowQueries: 0 };

        try {
            const storageResult = await client.query({
                query: `
                    SELECT 
                        sum(bytes_on_disk) as storageBytes,
                        sum(rows) as rowCount
                    FROM system.parts
                    WHERE active = 1
                `,
                format: 'JSONEachRow'
            });
            const storageData = await storageResult.json() as any[];

            const slowQueryResult = await client.query({
                query: `
                    SELECT count() as slowQueries
                    FROM system.query_log
                    WHERE query_duration_ms > 1000 AND event_date >= today()
                `,
                format: 'JSONEachRow'
            });
            const slowQueryData = await slowQueryResult.json() as any[];

            return {
                storageBytes: storageData[0]?.storageBytes || 0,
                rowCount: storageData[0]?.rowCount || 0,
                slowQueries: slowQueryData[0]?.slowQueries || 0
            };
        } catch (error) {
            console.error('Failed to get ClickHouse stats:', error);
            return { storageBytes: 0, rowCount: 0, slowQueries: 0 };
        }
    }

    static async getTemporalStats(): Promise<TemporalStats> {
        const client = await createTemporalClient();
        if (!client) return { runningWorkflows: 0, failedWorkflows: 0 };

        try {
            const namespace = process.env.TEMPORAL_NAMESPACE || 'default';

            const runningCount = await client.connection.workflowService.countWorkflowExecutions({
                namespace,
                query: 'ExecutionStatus="Running"'
            });

            const failedCount = await client.connection.workflowService.countWorkflowExecutions({
                namespace,
                query: 'ExecutionStatus="Failed" AND StartTime > "24 hours ago"'
            });

            return {
                runningWorkflows: Number(runningCount.count || 0),
                failedWorkflows: Number(failedCount.count || 0)
            };
        } catch (error) {
            console.error('Failed to get Temporal stats:', error);
            return { runningWorkflows: 0, failedWorkflows: 0 };
        }
    }
}
