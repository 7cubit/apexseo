"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SiteAuditService = void 0;
class SiteAuditService {
    constructor(pageRepo) {
        this.pageRepo = pageRepo;
    }
    async runAudit(siteId) {
        var _a;
        const pages = await this.pageRepo.getPagesBySite(siteId);
        const issues = [];
        // 1. Broken Links (4xx, 5xx status codes)
        const brokenPages = pages.filter(p => p.status_code >= 400);
        if (brokenPages.length > 0) {
            issues.push({
                type: 'broken_links',
                severity: brokenPages.some(p => p.status_code >= 500) ? 'critical' : 'warning',
                affectedPages: brokenPages.length,
                exampleUrl: brokenPages[0].url,
                description: `${brokenPages.length} pages return error status codes`,
                fix: 'Fix broken pages or set up proper redirects'
            });
        }
        // 2. Duplicate Titles
        const titleCounts = new Map();
        for (const page of pages) {
            if (page.title) {
                titleCounts.set(page.title, (titleCounts.get(page.title) || 0) + 1);
            }
        }
        const duplicateTitles = Array.from(titleCounts.entries()).filter(([_, count]) => count > 1);
        if (duplicateTitles.length > 0) {
            issues.push({
                type: 'duplicate_titles',
                severity: 'warning',
                affectedPages: duplicateTitles.reduce((sum, [_, count]) => sum + count, 0),
                exampleUrl: ((_a = pages.find(p => p.title === duplicateTitles[0][0])) === null || _a === void 0 ? void 0 : _a.url) || '',
                description: `${duplicateTitles.length} duplicate title tags found`,
                fix: 'Make each page title unique and descriptive'
            });
        }
        // 3. Missing H1 Tags
        const missingH1 = pages.filter(p => !p.h1 || p.h1.length === 0);
        if (missingH1.length > 0) {
            issues.push({
                type: 'missing_h1',
                severity: 'critical',
                affectedPages: missingH1.length,
                exampleUrl: missingH1[0].url,
                description: `${missingH1.length} pages missing H1 tags`,
                fix: 'Add a unique H1 tag to each page'
            });
        }
        // 4. Thin Content (< 300 words)
        const thinContent = pages.filter(p => (p.word_count || 0) < 300);
        if (thinContent.length > 0) {
            issues.push({
                type: 'thin_content',
                severity: 'warning',
                affectedPages: thinContent.length,
                exampleUrl: thinContent[0].url,
                description: `${thinContent.length} pages have less than 300 words`,
                fix: 'Expand content to at least 300 words for better SEO'
            });
        }
        // 5. Orphan Pages (using our existing detection)
        const orphans = await this.pageRepo.getSemanticOrphans(siteId);
        if (orphans.length > 0) {
            issues.push({
                type: 'orphan_pages',
                severity: 'warning',
                affectedPages: orphans.length,
                exampleUrl: orphans[0].url,
                description: `${orphans.length} pages are isolated from the site structure`,
                fix: 'Add internal links to connect orphan pages'
            });
        }
        // 6. Missing Canonical Tags
        const missingCanonical = pages.filter(p => !p.canonical_id);
        if (missingCanonical.length > 0) {
            issues.push({
                type: 'missing_canonical',
                severity: 'notice',
                affectedPages: missingCanonical.length,
                exampleUrl: missingCanonical[0].url,
                description: `${missingCanonical.length} pages missing canonical tags`,
                fix: 'Add canonical tags to avoid duplicate content issues'
            });
        }
        // Calculate crawl stats
        const crawlStats = {
            status2xx: pages.filter(p => p.status_code >= 200 && p.status_code < 300).length,
            status3xx: pages.filter(p => p.status_code >= 300 && p.status_code < 400).length,
            status4xx: pages.filter(p => p.status_code >= 400 && p.status_code < 500).length,
            status5xx: pages.filter(p => p.status_code >= 500).length,
            avgResponseTime: 0 // Would need to track this in crawler
        };
        // Calculate health score (inverse of issue severity)
        const criticalIssues = issues.filter(i => i.severity === 'critical').length;
        const warningIssues = issues.filter(i => i.severity === 'warning').length;
        const healthScore = Math.max(0, 100 - (criticalIssues * 20) - (warningIssues * 5));
        return {
            healthScore,
            totalPages: pages.length,
            issueCount: issues.length,
            issues,
            crawlStats
        };
    }
}
exports.SiteAuditService = SiteAuditService;
