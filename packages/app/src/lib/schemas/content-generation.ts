import { z } from 'zod';

export const contentGenerationSchema = z.object({
    // Section 1: Content Basics
    targetKeyword: z.string().min(1, "Target keyword is required"),
    secondaryKeywords: z.array(z.string()).max(5, "Max 5 secondary keywords"),
    contentType: z.enum([
        'How-To Guide',
        'Listicle',
        'Ultimate Guide',
        'Comparison',
        'Review',
        'Tutorial'
    ]),

    // Section 2: Project Context
    projectId: z.string().min(1, "Project is required"),
    // These are likely derived from project but might be overridable
    productsToMention: z.array(z.string()).optional(),

    // Section 3: AI Configuration
    researchProvider: z.enum(['perplexity', 'openai']),
    draftingProvider: z.enum(['openai', 'claude', 'grok']),
    audienceLevel: z.enum(['Beginner', 'Intermediate', 'Expert']),
    perspective: z.enum(['First Person', 'Second Person', 'Third Person']),

    // Section 4: Advanced Options
    wordCountTarget: z.number().min(500).max(5000),
    toneAdjustment: z.number().min(-2).max(2), // -2 to +2
    includeSections: z.array(z.enum(['FAQ', 'Key Takeaways', 'Infographic Data', 'Video Script'])),

    // Section 5: Internal Linking
    internalLinks: z.array(z.object({
        postId: z.string(),
        title: z.string(),
        url: z.string(),
        relevanceScore: z.number()
    })).optional()
});

export type ContentGenerationFormData = z.infer<typeof contentGenerationSchema>;
