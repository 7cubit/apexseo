
export const PLANS = {
    LITE: {
        id: 'lite',
        name: 'Lite',
        priceId: 'price_1Sd1ObSJ9LVGd8kdXcu3wOzs',
        limits: {
            projects: 1,
            keywords: 100,
            users: 1,
        }
    },
    STANDARD: {
        id: 'standard',
        name: 'Standard',
        priceId: 'price_1Sd1P2SJ9LVGd8kdmVKN0rCN',
        limits: {
            projects: 5,
            keywords: 500,
            users: 3,
        }
    },
    PROFESSIONAL: {
        id: 'professional',
        name: 'Professional',
        priceId: 'price_1Sd1PXSJ9LVGd8kdNDWTTKUh',
        limits: {
            projects: 15,
            keywords: 2000,
            users: 10,
        }
    },
    AGENCY: {
        id: 'agency',
        name: 'Agency',
        priceId: 'price_1Sd1PuSJ9LVGd8kdJiX9JWf5',
        limits: {
            projects: 50,
            keywords: 10000,
            users: 50,
        }
    }
} as const;

export type PlanType = keyof typeof PLANS;
export type PlanConfig = typeof PLANS[PlanType];
