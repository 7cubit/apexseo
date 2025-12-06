import { z } from 'zod';

export const seoMetadataSchema = z.object({
    // Section 1: Title Tag
    title: z.string().max(60, "Title should be under 60 characters").min(1, "Title is required"),

    // Section 2: Meta Description
    description: z.string().max(160, "Description should be under 160 characters"),

    // Section 3: URL Slug
    slug: z.string().regex(/^[a-z0-9-]+$/, "Slug must be lowercase, numbers, and hyphens only"),

    // Section 4: Open Graph
    ogImage: z.string().optional(),
    ogTitle: z.string().optional(),
    ogDescription: z.string().optional(),

    // Section 5: Schema Markup
    schemaType: z.enum(['Article', 'BlogPosting', 'HowTo', 'Recipe', 'Review']),

    // Section 6: Advanced
    canonicalUrl: z.string().url().optional().or(z.literal('')),
    robotsIndex: z.boolean().default(true),
    robotsFollow: z.boolean().default(true),
    robotsNoArchive: z.boolean().default(false),
    focusKeyphrase: z.string().optional(),
    enableBreadcrumbs: z.boolean().default(true)
});

export type SeoMetadataFormData = z.infer<typeof seoMetadataSchema>;
