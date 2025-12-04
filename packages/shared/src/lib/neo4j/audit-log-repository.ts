import { getDriver, DATABASE } from './driver';
import { v4 as uuidv4 } from 'uuid';

export interface AuditLog {
    id: string;
    admin_id: string;
    action: string;
    entity_type: string;
    entity_id: string;
    details?: string; // JSON string
    ip_address?: string;
    created_at: string;
}

export class AuditLogRepository {
    private getSession() {
        const driver = getDriver();
        if (!driver) {
            throw new Error('Neo4j driver not initialized');
        }
        return driver.session({ database: DATABASE });
    }

    async create(log: Omit<AuditLog, 'id' | 'created_at'>): Promise<AuditLog> {
        const session = this.getSession();
        try {
            const id = uuidv4();
            const now = new Date().toISOString();
            const result = await session.run(
                `
                CREATE (l:AuditLog {
                    id: $id,
                    admin_id: $admin_id,
                    action: $action,
                    entity_type: $entity_type,
                    entity_id: $entity_id,
                    details: $details,
                    ip_address: $ip_address,
                    created_at: $now
                })
                RETURN l
                `,
                { ...log, id, now }
            );
            return result.records[0].get('l').properties;
        } finally {
            await session.close();
        }
    }

    async list(limit: number = 20, offset: number = 0, filters: { adminId?: string; action?: string; entityType?: string } = {}): Promise<AuditLog[]> {
        const session = this.getSession();
        try {
            let query = `MATCH (l:AuditLog)`;
            const params: any = {
                limit: Number(limit),
                offset: Number(offset)
            };
            const whereClauses: string[] = [];

            if (filters.adminId) {
                whereClauses.push(`l.admin_id = $adminId`);
                params.adminId = filters.adminId;
            }
            if (filters.action) {
                whereClauses.push(`l.action = $action`);
                params.action = filters.action;
            }
            if (filters.entityType) {
                whereClauses.push(`l.entity_type = $entityType`);
                params.entityType = filters.entityType;
            }

            if (whereClauses.length > 0) {
                query += ` WHERE ${whereClauses.join(' AND ')}`;
            }

            query += ` RETURN l ORDER BY l.created_at DESC SKIP $offset LIMIT $limit`;

            const result = await session.run(query, params);
            return result.records.map((record: any) => record.get('l').properties);
        } finally {
            await session.close();
        }
    }

    async getById(id: string): Promise<AuditLog | null> {
        const session = this.getSession();
        try {
            const result = await session.run(
                `
                MATCH (l:AuditLog {id: $id})
                RETURN l
                `,
                { id }
            );
            if (result.records.length === 0) return null;
            return result.records[0].get('l').properties;
        } finally {
            await session.close();
        }
    }
}
