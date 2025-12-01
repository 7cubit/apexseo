export interface OnPageIssue {
    type: string;
    severity: 'critical' | 'warning' | 'notice';
    message: string;
    element?: string;
    recommendation: string;
}

export interface OnPageAuditResult {
    score: number; // 0-100
    issues: OnPageIssue[];
    checks: {
        title: boolean;
        metaDescription: boolean;
        h1: boolean;
        headerHierarchy: boolean;
        imageAlt: boolean;
        internalLinks: boolean;
        contentLength: boolean;
        keywordDensity: boolean;
        schema: boolean;
        canonical: boolean;
    };
}

export class OnPageAuditService {
    static async auditPage(pageId: string, targetKeyword?: string): Promise<OnPageAuditResult> {
        const { ClickHousePageRepository } = await import('../clickhouse/repositories/ClickHousePageRepository');
        const page = await ClickHousePageRepository.getPageById(pageId) as any;

        if (!page) {
            throw new Error('Page not found');
        }

        const issues: OnPageIssue[] = [];
        const checks = {
            title: false,
            metaDescription: false,
            h1: false,
            headerHierarchy: false,
            imageAlt: false,
            internalLinks: false,
            contentLength: false,
            keywordDensity: false,
            schema: false,
            canonical: false
        };

        // 1. Title Tag Check
        if (!page.title || page.title.length === 0) {
            issues.push({
                type: 'title',
                severity: 'critical',
                message: 'Missing title tag',
                recommendation: 'Add a descriptive title tag (50-60 characters)'
            });
        } else if (page.title.length < 30 || page.title.length > 60) {
            issues.push({
                type: 'title',
                severity: 'warning',
                message: `Title length is ${page.title.length} characters (optimal: 50-60)`,
                recommendation: 'Adjust title length to 50-60 characters'
            });
        } else {
            checks.title = true;
        }

        // 2. Meta Description (would need to be stored in page data)
        // For MVP, assume it's missing
        checks.metaDescription = false;

        // 3. H1 Tag Check
        if (!page.h1 || page.h1.length === 0) {
            issues.push({
                type: 'h1',
                severity: 'critical',
                message: 'Missing H1 tag',
                recommendation: 'Add a unique H1 tag with target keyword'
            });
        } else {
            checks.h1 = true;
        }

        // 4. Content Length
        const wordCount = page.word_count || 0;
        if (wordCount < 300) {
            issues.push({
                type: 'content',
                severity: 'warning',
                message: `Content is too short (${wordCount} words)`,
                recommendation: 'Aim for at least 300 words for better SEO'
            });
        } else {
            checks.contentLength = true;
        }

        // 5. Internal Links
        const internalLinkCount = page.link_count_internal || 0;
        if (internalLinkCount < 3) {
            issues.push({
                type: 'internal_links',
                severity: 'warning',
                message: `Only ${internalLinkCount} internal links found`,
                recommendation: 'Add at least 3 internal links to related content'
            });
        } else if (internalLinkCount > 100) {
            issues.push({
                type: 'internal_links',
                severity: 'notice',
                message: `Too many internal links (${internalLinkCount})`,
                recommendation: 'Consider reducing to under 100 links'
            });
        } else {
            checks.internalLinks = true;
        }

        // 6. Keyword Density (if target keyword provided)
        if (targetKeyword && page.text) {
            const keywordCount = (page.text.toLowerCase().match(new RegExp(targetKeyword.toLowerCase(), 'g')) || []).length;
            const density = (keywordCount / wordCount) * 100;

            if (density < 0.5 || density > 3) {
                issues.push({
                    type: 'keyword',
                    severity: 'notice',
                    message: `Keyword density is ${density.toFixed(2)}% (optimal: 1-3%)`,
                    recommendation: `Adjust keyword usage to 1-3% density`
                });
            } else {
                checks.keywordDensity = true;
            }
        }

        // 7. Canonical Tag
        if (!page.canonical_id) {
            issues.push({
                type: 'canonical',
                severity: 'notice',
                message: 'Missing canonical tag',
                recommendation: 'Add a canonical tag to avoid duplicate content issues'
            });
        } else {
            checks.canonical = true;
        }

        // Calculate score
        const totalChecks = Object.keys(checks).length;
        const passedChecks = Object.values(checks).filter(Boolean).length;
        const score = Math.round((passedChecks / totalChecks) * 100);

        return {
            score,
            issues,
            checks
        };
    }
}
