import { z } from "zod";

export const projectBasicsSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters").max(50),
    domain: z.string().url("Must be a valid URL").or(z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/, "Invalid domain format")),
});

export const projectConfigSchema = z.object({
    userAgent: z.string().default("ApexSEO-Bot/1.0"),
    maxPages: z.number().min(1).max(10000).default(100),
    ignorePatterns: z.string().optional(), // Comma separated
});

export const projectScheduleSchema = z.object({
    frequency: z.enum(["manual", "daily", "weekly", "monthly"]).default("manual"),
    time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)").optional(),
});

export const createProjectSchema = projectBasicsSchema
    .merge(projectConfigSchema)
    .merge(projectScheduleSchema);

export type ProjectBasics = z.infer<typeof projectBasicsSchema>;
export type ProjectConfig = z.infer<typeof projectConfigSchema>;
export type ProjectSchedule = z.infer<typeof projectScheduleSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
