import { getDriver, DATABASE } from './driver';
import { v4 as uuidv4 } from 'uuid';

export enum AdminRole {
    SUPER_ADMIN = 'SUPER_ADMIN',
    BILLING_ADMIN = 'BILLING_ADMIN',
    SUPPORT_ADMIN = 'SUPPORT_ADMIN',
    TECH_ADMIN = 'TECH_ADMIN',
    READONLY = 'READONLY'
}

export interface Admin {
    id: string;
    email: string;
    password_hash: string;
    role: AdminRole;
    two_factor_secret?: string;
    is_active: boolean;
    last_login_at?: string;
    created_at: string;
    updated_at: string;
}

export class AdminRepository {
    private getSession() {
        const driver = getDriver();
        if (!driver) {
            throw new Error('Neo4j driver not initialized');
        }
        return driver.session({ database: DATABASE });
    }

    async create(admin: Omit<Admin, 'id' | 'created_at' | 'updated_at'>): Promise<Admin> {
        const session = this.getSession();
        try {
            const id = uuidv4();
            const now = new Date().toISOString();
            const result = await session.run(
                `
                CREATE (a:Admin {
                    id: $id,
                    email: $email,
                    password_hash: $password_hash,
                    role: $role,
                    two_factor_secret: $two_factor_secret,
                    is_active: $is_active,
                    created_at: $now,
                    updated_at: $now
                })
                RETURN a
                `,
                { ...admin, id, now, two_factor_secret: admin.two_factor_secret || null }
            );
            return result.records[0].get('a').properties;
        } finally {
            await session.close();
        }
    }

    async findByEmail(email: string): Promise<Admin | null> {
        const session = this.getSession();
        try {
            const result = await session.run(
                `
                MATCH (a:Admin {email: $email})
                RETURN a
                `,
                { email }
            );
            if (result.records.length === 0) return null;
            return result.records[0].get('a').properties;
        } finally {
            await session.close();
        }
    }

    async findById(id: string): Promise<Admin | null> {
        const session = this.getSession();
        try {
            const result = await session.run(
                `
                MATCH (a:Admin {id: $id})
                RETURN a
                `,
                { id }
            );
            if (result.records.length === 0) return null;
            return result.records[0].get('a').properties;
        } finally {
            await session.close();
        }
    }

    async update(id: string, updates: Partial<Admin>): Promise<Admin | null> {
        const session = this.getSession();
        try {
            const setClause = Object.keys(updates)
                .map(key => `a.${key} = $${key}`)
                .join(', ');

            if (!setClause) return this.findById(id);

            const result = await session.run(
                `
                MATCH (a:Admin {id: $id})
                SET ${setClause}, a.updated_at = $now
                RETURN a
                `,
                { ...updates, id, now: new Date().toISOString() }
            );
            if (result.records.length === 0) return null;
            return result.records[0].get('a').properties;
        } finally {
            await session.close();
        }
    }
}
