"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnPageAuditService = void 0;
class OnPageAuditService {
    static async auditPage(pageId, targetKeyword) {
        const { ClickHousePageRepository } = await Promise.resolve().then(() => __importStar(require('../clickhouse/repositories/ClickHousePageRepository')));
        const page = await ClickHousePageRepository.getPageById(pageId);
        if (!page) {
            throw new Error('Page not found');
        }
        const issues = [];
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
        }
        else if (page.title.length < 30 || page.title.length > 60) {
            issues.push({
                type: 'title',
                severity: 'warning',
                message: `Title length is ${page.title.length} characters (optimal: 50-60)`,
                recommendation: 'Adjust title length to 50-60 characters'
            });
        }
        else {
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
        }
        else {
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
        }
        else {
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
        }
        else if (internalLinkCount > 100) {
            issues.push({
                type: 'internal_links',
                severity: 'notice',
                message: `Too many internal links (${internalLinkCount})`,
                recommendation: 'Consider reducing to under 100 links'
            });
        }
        else {
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
            }
            else {
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
        }
        else {
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
exports.OnPageAuditService = OnPageAuditService;
