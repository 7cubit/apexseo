import { z } from 'zod';

export const validators = {
    email: z.string().email(),
    url: z.string().url(),
    uuid: z.string().uuid(),
    nonEmptyString: z.string().min(1),
    positiveNumber: z.number().positive(),

    validate: <T>(schema: z.ZodSchema<T>, data: unknown): { success: boolean; data?: T; error?: string } => {
        const result = schema.safeParse(data);
        if (result.success) {
            return { success: true, data: result.data };
        } else {
            return { success: false, error: result.error.message };
        }
    }
};
