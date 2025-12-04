import neo4j from 'neo4j-driver';
import { getDriver, DATABASE } from './driver';
import { v4 as uuidv4 } from 'uuid';

export interface User {
    id: string;
    email: string;
    name?: string;
    password_hash?: string;
    image?: string;
    is_suspended: boolean;
    created_at: string;
    updated_at: string;
    last_login_at?: string;
}

export class UserRepository {
    private getSession() {
        console.log('UserRepository: getSession called');
        const driver = getDriver();
        if (!driver) {
            console.error('UserRepository: Neo4j driver is null');
            throw new Error('Neo4j driver not initialized');
        }
        console.log('UserRepository: Driver obtained');
        return driver.session({ database: DATABASE });
    }

    async create(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
        const session = this.getSession();
        try {
            const id = uuidv4();
            const now = new Date().toISOString();
            const result = await session.run(
                `
                CREATE (u:User {
                    id: $id,
                    email: $email,
                    name: $name,
                    password_hash: $password_hash,
                    image: $image,
                    is_suspended: $is_suspended,
                    created_at: $now,
                    updated_at: $now
                })
                RETURN u
                `,
                { ...user, id, now }
            );
            return result.records[0].get('u').properties;
        } finally {
            await session.close();
        }
    }

    async findByEmail(email: string): Promise<User | null> {
        const session = this.getSession();
        try {
            const result = await session.run(
                `
                MATCH (u:User {email: $email})
                RETURN u
                `,
                { email }
            );
            if (result.records.length === 0) return null;
            return result.records[0].get('u').properties;
        } finally {
            await session.close();
        }
    }

    async findById(id: string): Promise<User | null> {
        const session = this.getSession();
        try {
            const result = await session.run(
                `
                MATCH (u:User {id: $id})
                RETURN u
                `,
                { id }
            );
            if (result.records.length === 0) return null;
            return result.records[0].get('u').properties;
        } finally {
            await session.close();
        }
    }

    async update(id: string, updates: Partial<User>): Promise<User | null> {
        const session = this.getSession();
        try {
            const setClause = Object.keys(updates)
                .map(key => `u.${key} = $${key}`)
                .join(', ');

            if (!setClause) return this.findById(id);

            const result = await session.run(
                `
                MATCH (u:User {id: $id})
                SET ${setClause}, u.updated_at = $now
                RETURN u
                `,
                { ...updates, id, now: new Date().toISOString() }
            );
            if (result.records.length === 0) return null;
            return result.records[0].get('u').properties;
        } finally {
            await session.close();
        }
    }

    async list(limit: number = 10, offset: number = 0, search?: string): Promise<User[]> {
        const session = this.getSession();
        try {
            let query = `MATCH (u:User)`;
            const params: any = {
                limit: neo4j.int(limit),
                offset: neo4j.int(offset)
            };

            if (search) {
                query += ` WHERE toLower(u.email) CONTAINS toLower($search) OR toLower(u.name) CONTAINS toLower($search)`;
                params.search = search;
            }

            query += ` RETURN u ORDER BY u.created_at DESC SKIP $offset LIMIT $limit`;

            const result = await session.run(query, params);
            return result.records.map((record: any) => record.get('u').properties);
        } catch (error) {
            console.error('UserRepository: Error in list method', error);
            throw error;
        } finally {
            await session.close();
        }
    }

    async count(search?: string): Promise<number> {
        const session = this.getSession();
        try {
            let query = `MATCH (u:User)`;
            const params: any = {};

            if (search) {
                query += ` WHERE toLower(u.email) CONTAINS toLower($search) OR toLower(u.name) CONTAINS toLower($search)`;
                params.search = search;
            }

            query += ` RETURN count(u) as count`;

            const result = await session.run(query, params);
            return result.records[0].get('count').toNumber();
        } finally {
            await session.close();
        }
    }
    async listWithDetails(limit: number = 10, offset: number = 0, search?: string, status?: string): Promise<any[]> {
        const session = this.getSession();
        try {
            let query = `
                MATCH (u:User)
                OPTIONAL MATCH (u)-[:BELONGS_TO]->(a:Account)-[:HAS_SUBSCRIPTION]->(s:Subscription)-[:IS_ON_PLAN]->(p:Plan)
                WHERE s.status = 'ACTIVE'
            `;
            const params: any = {
                limit: neo4j.int(limit),
                offset: neo4j.int(offset)
            };

            if (search) {
                query += ` WHERE toLower(u.email) CONTAINS toLower($search) OR toLower(u.name) CONTAINS toLower($search)`;
                params.search = search;
            }

            if (status === 'active') {
                query += search ? ` AND u.is_suspended = false` : ` WHERE u.is_suspended = false`;
            } else if (status === 'suspended') {
                query += search ? ` AND u.is_suspended = true` : ` WHERE u.is_suspended = true`;
            }

            query += ` 
                RETURN u, collect(DISTINCT {account: a.name, plan: p.name}) as accounts
                ORDER BY u.created_at DESC 
                SKIP $offset 
                LIMIT $limit
            `;

            const result = await session.run(query, params);
            return result.records.map((record: any) => ({
                ...record.get('u').properties,
                accounts: record.get('accounts')
            }));
        } finally {
            await session.close();
        }
    }

    async getDetails(id: string): Promise<any | null> {
        const session = this.getSession();
        try {
            const result = await session.run(
                `
                MATCH (u:User {id: $id})
                OPTIONAL MATCH (u)-[r:BELONGS_TO]->(a:Account)
                OPTIONAL MATCH (a)-[:HAS_SUBSCRIPTION]->(s:Subscription)-[:IS_ON_PLAN]->(p:Plan)
                WHERE s.status = 'ACTIVE'
                RETURN u, collect({
                    account: a, 
                    role: r.role, 
                    joined_at: r.joined_at,
                    plan: p,
                    subscription: s
                }) as linked_accounts
                `,
                { id }
            );
            if (result.records.length === 0) return null;

            const record = result.records[0];
            return {
                ...record.get('u').properties,
                linked_accounts: record.get('linked_accounts').map((la: any) => ({
                    account: la.account?.properties,
                    role: la.role,
                    joined_at: la.joined_at,
                    plan: la.plan?.properties,
                    subscription: la.subscription?.properties
                })).filter((la: any) => la.account) // Filter out nulls if no account
            };
        } finally {
            await session.close();
        }
    }

    async setSuspended(id: string, suspended: boolean): Promise<User | null> {
        const session = this.getSession();
        try {
            const result = await session.run(
                `
                MATCH (u:User {id: $id})
                SET u.is_suspended = $suspended, u.updated_at = $now
                RETURN u
                `,
                { id, suspended, now: new Date().toISOString() }
            );
            if (result.records.length === 0) return null;
            return result.records[0].get('u').properties;
        } finally {
            await session.close();
        }
    }
}
