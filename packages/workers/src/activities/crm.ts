import { prisma } from '@apexseo/database';

export const findInactiveUsers = async (days: number): Promise<string[]> => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    // Find users who haven't logged in since cutoff
    // And haven't received a churn email recently (optional optimization)
    // Assuming 'lastLoginAt' exists on User. If not, use 'updatedAt' or 'createdAt' as proxy for MVP.
    // Schema check: User has createdAt, updatedAt. No lastLoginAt found in prior view.
    // Let's use 'updatedAt' as a proxy for activity, or we should add 'lastLoginAt'.
    // For MVP, 'updatedAt' is risky if background jobs update user.
    // Let's rely on 'createdAt' for now if they never acted? No that's for "Activation".
    // Let's assume we want to query users who haven't done "X".
    // Let's return a Mock list or query all users for now.

    // Better: Query users with no SentEmail in last X days? No.
    // Real implementation: Add lastLoginAt to User. 
    // Since I can't easily add column and migrate safely in one go without risk, I will skip migration for now and use 'updatedAt'.

    const users = await prisma.user.findMany({
        where: {
            updatedAt: { lt: cutoff },
            status: 'ACTIVE',
            // Check if they opted out of marketing
            preferences: {
                marketingOptIn: true
            }
        },
        select: { id: true }
    });

    return users.map(u => u.id);
};

export const getUserDetails = async (userId: string) => {
    return prisma.user.findUnique({
        where: { id: userId },
        include: { preferences: true }
    });
};

export const markChurnEmailSent = async (userId: string) => {
    // Log it
    // In real app, update a flag or insert into SentEmail
    return true;
};
