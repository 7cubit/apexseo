import { Session } from 'neo4j-driver';
import { getDriver } from './driver';
import { v4 as uuidv4 } from 'uuid';

export interface FeatureFlag {
    key: string;
    description: string;
    defaultValue: boolean;
    isEnabled: boolean;
}

export interface SystemConfig {
    maintenanceMode: boolean;
    announcement?: string;
    globalRateLimit: number;
}

export class SettingsRepository {
    private getSession(): Session {
        const driver = getDriver();
        if (!driver) {
            throw new Error('Neo4j driver not initialized');
        }
        return driver.session();
    }

    // Feature Flags
    async createFlag(key: string, description: string, defaultValue: boolean): Promise<FeatureFlag> {
        const session = this.getSession();
        try {
            const result = await session.run(
                `
                MERGE (f:FeatureFlag {key: $key})
                SET f.description = $description, 
                    f.defaultValue = $defaultValue,
                    f.isEnabled = $defaultValue
                RETURN f
                `,
                { key, description, defaultValue }
            );
            return result.records[0].get('f').properties;
        } finally {
            await session.close();
        }
    }

    async listFlags(): Promise<FeatureFlag[]> {
        const session = this.getSession();
        try {
            const result = await session.run(`MATCH (f:FeatureFlag) RETURN f ORDER BY f.key`);
            return result.records.map(record => record.get('f').properties);
        } finally {
            await session.close();
        }
    }

    async setPlanOverride(planId: string, flagKey: string, enabled: boolean): Promise<void> {
        const session = this.getSession();
        try {
            await session.run(
                `
                MATCH (p:Plan {id: $planId})
                MATCH (f:FeatureFlag {key: $flagKey})
                MERGE (p)-[r:OVERRIDES_FLAG]->(f)
                SET r.enabled = $enabled
                `,
                { planId, flagKey, enabled }
            );
        } finally {
            await session.close();
        }
    }

    async setAccountOverride(accountId: string, flagKey: string, enabled: boolean): Promise<void> {
        const session = this.getSession();
        try {
            await session.run(
                `
                MATCH (a:Account {id: $accountId})
                MATCH (f:FeatureFlag {key: $flagKey})
                MERGE (a)-[r:OVERRIDES_FLAG]->(f)
                SET r.enabled = $enabled
                `,
                { accountId, flagKey, enabled }
            );
        } finally {
            await session.close();
        }
    }

    async getOverrides(): Promise<any[]> {
        const session = this.getSession();
        try {
            const result = await session.run(`
                MATCH (entity)-[r:OVERRIDES_FLAG]->(f:FeatureFlag)
                RETURN entity.id as entityId, labels(entity) as entityType, f.key as flagKey, r.enabled as enabled
            `);
            return result.records.map(record => ({
                entityId: record.get('entityId'),
                entityType: record.get('entityType')[0],
                flagKey: record.get('flagKey'),
                enabled: record.get('enabled')
            }));
        } finally {
            await session.close();
        }
    }

    // System Config
    async getSystemConfig(): Promise<SystemConfig> {
        const session = this.getSession();
        try {
            const result = await session.run(`
                MERGE (c:SystemConfig {id: 'global'})
                ON CREATE SET c.maintenanceMode = false, c.globalRateLimit = 1000
                RETURN c
            `);
            return result.records[0].get('c').properties;
        } finally {
            await session.close();
        }
    }

    async updateSystemConfig(config: Partial<SystemConfig>): Promise<SystemConfig> {
        const session = this.getSession();
        try {
            const result = await session.run(
                `
                MATCH (c:SystemConfig {id: 'global'})
                SET c += $config
                RETURN c
                `,
                { config }
            );
            return result.records[0].get('c').properties;
        } finally {
            await session.close();
        }
    }
}
