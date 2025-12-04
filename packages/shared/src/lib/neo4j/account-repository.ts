import { Driver, Session } from 'neo4j-driver';
import { v4 as uuidv4 } from 'uuid';
import { getDriver } from './driver';

export interface Account {
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
}

export class AccountRepository {
    private getSession(): Session {
        const driver = getDriver();
        if (!driver) {
            throw new Error('Neo4j driver not initialized');
        }
        return driver.session();
    }

    async create(name: string): Promise<Account> {
        const session = this.getSession();
        try {
            const id = uuidv4();
            const now = new Date().toISOString();
            const result = await session.run(
                `
                CREATE (a:Account {
                    id: $id,
                    name: $name,
                    created_at: $now,
                    updated_at: $now
                })
                RETURN a
                `,
                { id, name, now }
            );
            return result.records[0].get('a').properties;
        } finally {
            await session.close();
        }
    }

    async findById(id: string): Promise<Account | null> {
        const session = this.getSession();
        try {
            const result = await session.run(
                `
                MATCH (a:Account {id: $id})
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

    async list(limit: number = 10, offset: number = 0, search?: string): Promise<{ accounts: Account[], total: number }> {
        const session = this.getSession();
        try {
            let query = `MATCH (a:Account)`;
            const params: any = { limit: neo4j.int(limit), offset: neo4j.int(offset) };

            if (search) {
                query += ` WHERE toLower(a.name) CONTAINS toLower($search)`;
                params.search = search;
            }

            const countResult = await session.run(
                `${query} RETURN count(a) as total`,
                params
            );
            const total = countResult.records[0].get('total').toNumber();

            const listResult = await session.run(
                `
                ${query}
                RETURN a
                ORDER BY a.created_at DESC
                SKIP $offset
                LIMIT $limit
                `,
                params
            );

            const accounts = listResult.records.map(record => record.get('a').properties);
            return { accounts, total };
        } finally {
            await session.close();
        }
    }

    async listWithSubscription(limit: number = 10, offset: number = 0, search?: string): Promise<any[]> {
        const session = this.getSession();
        try {
            let query = `MATCH (a:Account)`;
            const params: any = { limit: neo4j.int(limit), offset: neo4j.int(offset) };

            if (search) {
                query += ` WHERE toLower(a.name) CONTAINS toLower($search)`;
                params.search = search;
            }

            query += `
                OPTIONAL MATCH (a)-[:HAS_SUBSCRIPTION]->(s:Subscription)-[:IS_ON_PLAN]->(p:Plan)
                WHERE s.status = 'ACTIVE'
                RETURN a, s, p
                ORDER BY a.created_at DESC
                SKIP $offset
                LIMIT $limit
            `;

            const result = await session.run(query, params);
            return result.records.map((record: any) => ({
                ...record.get('a').properties,
                subscription: record.get('s')?.properties,
                plan: record.get('p')?.properties
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
                MATCH (a:Account {id: $id})
                OPTIONAL MATCH (u:User)-[r:BELONGS_TO]->(a)
                OPTIONAL MATCH (a)-[:HAS_SUBSCRIPTION]->(s:Subscription)-[:IS_ON_PLAN]->(p:Plan)
                // Get all subscriptions (history)
                OPTIONAL MATCH (a)-[:HAS_SUBSCRIPTION]->(sh:Subscription)-[:IS_ON_PLAN]->(ph:Plan)
                RETURN a, 
                       collect(DISTINCT {user: u, role: r.role}) as users,
                       head(collect(DISTINCT {subscription: s, plan: p})) as current_subscription,
                       collect(DISTINCT {subscription: sh, plan: ph}) as subscription_history
                `,
                { id }
            );
            if (result.records.length === 0) return null;

            const record = result.records[0];
            const currentSub = record.get('current_subscription');

            // Filter out nulls from history if no history exists
            const history = record.get('subscription_history')
                .filter((h: any) => h.subscription)
                .map((h: any) => ({
                    ...h.subscription.properties,
                    plan: h.plan.properties
                }))
                .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

            return {
                ...record.get('a').properties,
                users: record.get('users').map((u: any) => ({
                    ...u.user.properties,
                    role: u.role
                })).filter((u: any) => u.id), // Filter out nulls
                current_subscription: currentSub?.subscription ? {
                    ...currentSub.subscription.properties,
                    plan: currentSub.plan.properties
                } : null,
                subscription_history: history
            };
        } finally {
            await session.close();
        }
    }

    async addUserToAccount(userId: string, accountId: string, role: string = 'MEMBER'): Promise<void> {
        const session = this.getSession();
        try {
            await session.run(
                `
                MATCH (u:User {id: $userId})
                MATCH (a:Account {id: $accountId})
                MERGE (u)-[r:BELONGS_TO]->(a)
                SET r.role = $role, r.joined_at = datetime()
                `,
                { userId, accountId, role }
            );
        } finally {
            await session.close();
        }
    }
}

import neo4j from 'neo4j-driver';
