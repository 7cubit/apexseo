import { getDriver, DATABASE } from '../driver';
import { v4 as uuidv4 } from 'uuid';

export interface BlockedDomain {
    id: string;
    domain: string;
    reason: string;
    created_at: string;
    created_by?: string;
}

export class BlockedDomainRepository {
    private getSession() {
        const driver = getDriver();
        if (!driver) {
            throw new Error('Neo4j driver not initialized');
        }
        return driver.session({ database: DATABASE });
    }

    async create(domain: string, reason: string, adminId?: string): Promise<BlockedDomain> {
        const session = this.getSession();
        try {
            const id = uuidv4();
            const now = new Date().toISOString();
            const result = await session.run(
                `
                CREATE (b:BlockedDomain {
                    id: $id,
                    domain: $domain,
                    reason: $reason,
                    created_at: $now,
                    created_by: $adminId
                })
                RETURN b
                `,
                { id, domain, reason, now, adminId }
            );
            return result.records[0].get('b').properties;
        } finally {
            await session.close();
        }
    }

    async list(): Promise<BlockedDomain[]> {
        const session = this.getSession();
        try {
            const result = await session.run(
                `
                MATCH (b:BlockedDomain)
                RETURN b
                ORDER BY b.created_at DESC
                `
            );
            return result.records.map(record => record.get('b').properties);
        } finally {
            await session.close();
        }
    }

    async delete(id: string): Promise<void> {
        const session = this.getSession();
        try {
            await session.run(
                `
                MATCH (b:BlockedDomain {id: $id})
                DELETE b
                `,
                { id }
            );
        } finally {
            await session.close();
        }
    }

    async isBlocked(domain: string): Promise<boolean> {
        const session = this.getSession();
        try {
            const result = await session.run(
                `
                MATCH (b:BlockedDomain)
                WHERE toLower(b.domain) = toLower($domain) OR toLower($domain) ENDS WITH toLower(b.domain)
                RETURN count(b) > 0 as blocked
                `,
                { domain }
            );
            return result.records[0].get('blocked');
        } finally {
            await session.close();
        }
    }
}
