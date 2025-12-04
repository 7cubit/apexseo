import { Driver, Session } from 'neo4j-driver';
import { v4 as uuidv4 } from 'uuid';
import { getDriver } from './driver';
import neo4j from 'neo4j-driver';

export interface Plan {
    id: string;
    name: string;
    price: number;
    currency: string;
    features: string[];
}

export interface Subscription {
    id: string;
    status: 'ACTIVE' | 'CANCELED' | 'PAST_DUE';
    current_period_end: string;
    cancel_at_period_end: boolean;
    created_at: string;
    updated_at: string;
}

export class SubscriptionRepository {
    private getSession(): Session {
        const driver = getDriver();
        if (!driver) {
            throw new Error('Neo4j driver not initialized');
        }
        return driver.session();
    }

    async createPlan(plan: Omit<Plan, 'id'>): Promise<Plan> {
        const session = this.getSession();
        try {
            const id = uuidv4();
            const result = await session.run(
                `
                CREATE (p:Plan {
                    id: $id,
                    name: $name,
                    price: $price,
                    currency: $currency,
                    features: $features
                })
                RETURN p
                `,
                { id, ...plan }
            );
            return result.records[0].get('p').properties;
        } finally {
            await session.close();
        }
    }

    async listPlans(): Promise<Plan[]> {
        const session = this.getSession();
        try {
            const result = await session.run(`MATCH (p:Plan) RETURN p`);
            return result.records.map(record => record.get('p').properties);
        } finally {
            await session.close();
        }
    }

    async subscribe(accountId: string, planId: string): Promise<Subscription> {
        const session = this.getSession();
        try {
            const id = uuidv4();
            const now = new Date().toISOString();
            // Default 30 days
            const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

            const result = await session.run(
                `
                MATCH (a:Account {id: $accountId})
                MATCH (p:Plan {id: $planId})
                // Cancel existing active subscriptions
                OPTIONAL MATCH (a)-[:HAS_SUBSCRIPTION]->(oldS:Subscription)
                WHERE oldS.status = 'ACTIVE'
                SET oldS.status = 'CANCELED', oldS.updated_at = $now

                CREATE (s:Subscription {
                    id: $id,
                    status: 'ACTIVE',
                    current_period_end: $periodEnd,
                    cancel_at_period_end: false,
                    created_at: $now,
                    updated_at: $now
                })
                CREATE (a)-[:HAS_SUBSCRIPTION]->(s)
                CREATE (s)-[:IS_ON_PLAN]->(p)
                RETURN s
                `,
                { accountId, planId, id, now, periodEnd }
            );
            return result.records[0].get('s').properties;
        } finally {
            await session.close();
        }
    }

    async cancel(subscriptionId: string): Promise<Subscription> {
        const session = this.getSession();
        try {
            const now = new Date().toISOString();
            const result = await session.run(
                `
                MATCH (s:Subscription {id: $subscriptionId})
                SET s.status = 'CANCELED', s.updated_at = $now, s.cancel_at_period_end = true
                RETURN s
                `,
                { subscriptionId, now }
            );
            return result.records[0].get('s').properties;
        } finally {
            await session.close();
        }
    }

    async getAccountSubscription(accountId: string): Promise<{ subscription: Subscription, plan: Plan } | null> {
        const session = this.getSession();
        try {
            const result = await session.run(
                `
                MATCH (a:Account {id: $accountId})-[:HAS_SUBSCRIPTION]->(s:Subscription)-[:IS_ON_PLAN]->(p:Plan)
                WHERE s.status = 'ACTIVE'
                RETURN s, p
                ORDER BY s.created_at DESC
                LIMIT 1
                `,
                { accountId }
            );
            if (result.records.length === 0) return null;
            return {
                subscription: result.records[0].get('s').properties,
                plan: result.records[0].get('p').properties
            };
        } finally {
            await session.close();
        }
    }
}
