import { z } from 'zod';

export const UserRoleSchema = z.enum(['SUPER_ADMIN', 'BILLING_ADMIN', 'PRODUCT_ADMIN', 'SUPPORT_ADMIN', 'VIEWER']);
export const UserStatusSchema = z.enum(['ACTIVE', 'SUSPENDED', 'PENDING']);
export const ProductTierSchema = z.enum(['STARTER', 'PRO', 'AGENCY']);
export const ProductIntervalSchema = z.enum(['MONTHLY', 'YEARLY']);

export const CreateUserSchema = z.object({
    email: z.string().email(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    role: UserRoleSchema.default('VIEWER'),
    planId: z.string().optional(), // Product ID
    status: UserStatusSchema.default('ACTIVE'),
});

export const UpdateUserSchema = CreateUserSchema.partial().extend({
    // Additional fields if needed for update only
});

export const BulkActionSchema = z.object({
    userIds: z.array(z.string()),
    action: z.enum(['suspend', 'activate', 'reset_password', 'delete']),
});

export const CreateProductSchema = z.object({
    name: z.string().min(1),
    tier: ProductTierSchema,
    price: z.number().min(0),
    interval: ProductIntervalSchema,
    featureFlags: z.record(z.string(), z.boolean()).optional().default({}), // Simple boolean flags for now
    isActive: z.boolean().default(true),
});

export const UpdateProductSchema = CreateProductSchema.partial();
