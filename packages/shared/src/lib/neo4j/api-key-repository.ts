import { getDriver, DATABASE } from './driver';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export interface ApiKey {
    id: string;
    key_prefix: string;
    name: string;
    status: 'ACTIVE' | 'REVOKED';
    created_at: string;
    last_used_at?: string;
    scopes: string[];
}

export class ApiKeyRepository {
    private getSession() {
        const driver = getDriver();
        if (!driver) {
            throw new Error('Neo4j driver not initialized');
        }
        return driver.session({ database: DATABASE });
    }

    private generateKey(): { key: string; hash: string; prefix: string } {
        const key = 'sk_' + crypto.randomBytes(24).toString('hex');
        const prefix = key.substring(0, 8);
        const hash = crypto.createHash('sha256').update(key).digest('hex');
        return { key, hash, prefix };
    }

    async create(accountId: string, name: string, scopes: string[] = []): Promise<{ apiKey: ApiKey; secretKey: string }> {
        const session = this.getSession();
        try {
            const { key, hash, prefix } = this.generateKey();
            const id = uuidv4();
            const now = new Date().toISOString();

            const result = await session.run(
                `
                MATCH (a:Account {id: $accountId})
                CREATE (k:ApiKey {
                    id: $id,
                    key_hash: $hash,
                    key_prefix: $prefix,
                    name: $name,
                    status: 'ACTIVE',
                    created_at: $now,
                    scopes: $scopes
                })
                CREATE (a)-[:HAS_API_KEY]->(k)
                RETURN k
                `,
                { accountId, id, hash, prefix, name, now, scopes }
            );

            const apiKey = result.records[0].get('k').properties;
            // Remove hash from returned object, but return the secret key once
            const { key_hash, ...safeApiKey } = apiKey;
            return { apiKey: safeApiKey, secretKey: key };
        } finally {
            await session.close();
        }
    }

    async listByAccount(accountId: string): Promise<ApiKey[]> {
        const session = this.getSession();
        try {
            const result = await session.run(
                `
                MATCH (a:Account {id: $accountId})-[:HAS_API_KEY]->(k:ApiKey)
                RETURN k
                ORDER BY k.created_at DESC
                `,
                { accountId }
            );
            return result.records.map(record => {
                const { key_hash, ...safeApiKey } = record.get('k').properties;
                return safeApiKey;
            });
        } finally {
            await session.close();
        }
    }

    async revoke(id: string): Promise<void> {
        const session = this.getSession();
        try {
            await session.run(
                `
                MATCH (k:ApiKey {id: $id})
                SET k.status = 'REVOKED', k.revoked_at = datetime()
                `,
                { id }
            );
        } finally {
            await session.close();
        }
    }
}
