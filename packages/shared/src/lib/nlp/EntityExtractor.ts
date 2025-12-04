/**
 * Entity and topic extraction for content analysis.
 * Identifies key terms, technical concepts, and entities in text.
 */

export interface ExtractedEntity {
    text: string;
    type: 'TECH' | 'CONCEPT' | 'KEYWORD' | 'TOOL' | 'FRAMEWORK';
    frequency: number;
    positions: number[]; // Character positions where entity appears
}

export class EntityExtractor {
    // Common technical terms and concepts in SEO/web development
    private static readonly TECH_TERMS = new Set([
        // SEO Terms
        'schema markup', 'structured data', 'meta description', 'canonical url',
        'robots.txt', 'sitemap', 'backlinks', 'internal linking', 'anchor text',
        'page speed', 'core web vitals', 'lcp', 'fid', 'cls', 'mobile-first',
        'crawl budget', 'indexability', 'noindex', 'nofollow', 'hreflang',

        // Web Technologies
        'javascript', 'typescript', 'react', 'vue', 'angular', 'next.js', 'nuxt',
        'html', 'css', 'sass', 'tailwind', 'bootstrap', 'webpack', 'vite',
        'node.js', 'express', 'fastify', 'nest.js', 'graphql', 'rest api',

        // Databases & Infrastructure
        'postgresql', 'mysql', 'mongodb', 'redis', 'clickhouse', 'neo4j',
        'docker', 'kubernetes', 'aws', 'gcp', 'azure', 'vercel', 'netlify',

        // AI/ML Terms
        'machine learning', 'embeddings', 'vector database', 'semantic search',
        'natural language processing', 'nlp', 'transformers', 'bert', 'gpt',
        'cosine similarity', 'clustering', 'k-means', 'neural network'
    ]);

    private static readonly FRAMEWORK_PATTERNS = [
        /\b(React|Vue|Angular|Svelte|Next\.js|Nuxt|Gatsby|Remix)\b/gi,
        /\b(Express|Fastify|Koa|Hapi|NestJS)\b/gi,
        /\b(TailwindCSS|Bootstrap|Material-UI|Chakra UI)\b/gi,
    ];

    /**
     * Extract entities from text using pattern matching and keyword detection.
     * 
     * @param text Content to analyze
     * @returns Array of extracted entities with metadata
     */
    static extractEntities(text: string): ExtractedEntity[] {
        const entities = new Map<string, ExtractedEntity>();
        const lowerText = text.toLowerCase();

        // 1. Extract technical terms
        for (const term of Array.from(this.TECH_TERMS)) {
            const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
            const matches = Array.from(text.matchAll(regex));

            if (matches.length > 0) {
                const positions = matches.map(m => m.index!);
                entities.set(term, {
                    text: term,
                    type: 'TECH',
                    frequency: matches.length,
                    positions
                });
            }
        }

        // 2. Extract frameworks and tools
        for (const pattern of this.FRAMEWORK_PATTERNS) {
            const matches = Array.from(text.matchAll(pattern));
            for (const match of matches) {
                const term = match[0].toLowerCase();
                if (entities.has(term)) {
                    const existing = entities.get(term)!;
                    existing.frequency++;
                    existing.positions.push(match.index!);
                } else {
                    entities.set(term, {
                        text: term,
                        type: 'FRAMEWORK',
                        frequency: 1,
                        positions: [match.index!]
                    });
                }
            }
        }

        // 3. Extract capitalized concepts (likely proper nouns or important terms)
        const conceptPattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g;
        const conceptMatches = Array.from(text.matchAll(conceptPattern));
        for (const match of conceptMatches) {
            const term = match[0].toLowerCase();
            // Skip if already captured or too short
            if (entities.has(term) || term.length < 4) continue;

            if (entities.has(term)) {
                const existing = entities.get(term)!;
                existing.frequency++;
                existing.positions.push(match.index!);
            } else {
                entities.set(term, {
                    text: term,
                    type: 'CONCEPT',
                    frequency: 1,
                    positions: [match.index!]
                });
            }
        }

        // 4. Extract important keywords (words appearing frequently)
        const words = lowerText.match(/\b[a-z]{4,}\b/g) || [];
        const wordFreq = new Map<string, number>();
        words.forEach(word => {
            wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
        });

        // Add high-frequency keywords (appearing 3+ times)
        for (const [word, freq] of Array.from(wordFreq.entries())) {
            if (freq >= 3 && !entities.has(word)) {
                // Find positions
                const regex = new RegExp(`\\b${word}\\b`, 'gi');
                const matches = Array.from(text.matchAll(regex));

                entities.set(word, {
                    text: word,
                    type: 'KEYWORD',
                    frequency: freq,
                    positions: matches.map(m => m.index!)
                });
            }
        }

        return Array.from(entities.values());
    }

    /**
     * Extract technical terms specifically (subset of entities).
     * 
     * @param text Content to analyze
     * @returns Array of technical term strings
     */
    static extractTechnicalTerms(text: string): string[] {
        const entities = this.extractEntities(text);
        return entities
            .filter(e => e.type === 'TECH' || e.type === 'FRAMEWORK' || e.type === 'TOOL')
            .map(e => e.text);
    }

    /**
     * Compare two entity sets and find entities missing from the user's content.
     * This is the core "missing topics" detection.
     * 
     * @param userEntities Entities extracted from user's page
     * @param competitorEntities Entities extracted from competitor pages
     * @returns Entities present in competitors but missing from user content
     */
    static findMissingEntities(
        userEntities: ExtractedEntity[],
        competitorEntities: ExtractedEntity[]
    ): ExtractedEntity[] {
        const userTerms = new Set(userEntities.map(e => e.text.toLowerCase()));

        // Find competitor entities not in user content
        const missing = competitorEntities.filter(
            compEntity => !userTerms.has(compEntity.text.toLowerCase())
        );

        // Aggregate by term (sum frequencies from all competitors)
        const aggregated = new Map<string, ExtractedEntity>();
        for (const entity of missing) {
            const key = entity.text.toLowerCase();
            if (aggregated.has(key)) {
                const existing = aggregated.get(key)!;
                existing.frequency += entity.frequency;
                existing.positions.push(...entity.positions);
            } else {
                aggregated.set(key, { ...entity });
            }
        }

        // Sort by frequency (most common missing terms first)
        return Array.from(aggregated.values())
            .sort((a, b) => b.frequency - a.frequency);
    }

    /**
     * Calculate term coverage: what % of competitor terms does the user have?
     * 
     * @param userEntities User's entities
     * @param competitorEntities Competitor entities
     * @returns Coverage percentage [0-100]
     */
    static calculateTermCoverage(
        userEntities: ExtractedEntity[],
        competitorEntities: ExtractedEntity[]
    ): number {
        if (competitorEntities.length === 0) return 100;

        const userTerms = new Set(userEntities.map(e => e.text.toLowerCase()));
        const competitorTerms = new Set(competitorEntities.map(e => e.text.toLowerCase()));

        const coveredTerms = Array.from(competitorTerms).filter(term =>
            userTerms.has(term)
        ).length;

        return (coveredTerms / competitorTerms.size) * 100;
    }

    /**
     * Get the most important missing entities (by frequency and type).
     * 
     * @param missingEntities All missing entities
     * @param limit Maximum number to return
     * @returns Top missing entities
     */
    static getTopMissingEntities(
        missingEntities: ExtractedEntity[],
        limit: number = 10
    ): ExtractedEntity[] {
        // Prioritize TECH and FRAMEWORK types, then by frequency
        return missingEntities
            .sort((a, b) => {
                // Tech/Framework terms get priority
                const aWeight = (a.type === 'TECH' || a.type === 'FRAMEWORK') ? 2 : 1;
                const bWeight = (b.type === 'TECH' || b.type === 'FRAMEWORK') ? 2 : 1;

                const aScore = a.frequency * aWeight;
                const bScore = b.frequency * bWeight;

                return bScore - aScore;
            })
            .slice(0, limit);
    }
}
