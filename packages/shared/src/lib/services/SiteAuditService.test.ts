import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SiteAuditService, IPageRepository } from './SiteAuditService';

describe('SiteAuditService', () => {
    const mockPages = [
        { url: 'https://example.com', status_code: 200, title: 'Home', h1: 'Welcome', word_count: 500, canonical_id: '1' },
        { url: 'https://example.com/broken', status_code: 404, title: 'Broken', h1: 'Error', word_count: 100, canonical_id: '2' },
        { url: 'https://example.com/thin', status_code: 200, title: 'Thin', h1: 'Thin', word_count: 100, canonical_id: '3' },
        { url: 'https://example.com/dup1', status_code: 200, title: 'Duplicate', h1: 'Dup', word_count: 500, canonical_id: '4' },
        { url: 'https://example.com/dup2', status_code: 200, title: 'Duplicate', h1: 'Dup', word_count: 500, canonical_id: '5' },
        { url: 'https://example.com/no-h1', status_code: 200, title: 'No H1', h1: '', word_count: 500, canonical_id: '6' },
        { url: 'https://example.com/no-canonical', status_code: 200, title: 'No Canonical', h1: 'NC', word_count: 500 }
    ];

    const mockOrphans = [
        { url: 'https://example.com/orphan' }
    ];

    let mockRepo: IPageRepository;

    beforeEach(() => {
        mockRepo = {
            getPagesBySite: vi.fn().mockResolvedValue(mockPages),
            getSemanticOrphans: vi.fn().mockResolvedValue(mockOrphans)
        };
    });

    it('should identify broken links', async () => {
        const service = new SiteAuditService(mockRepo);
        const result = await service.runAudit('example.com');

        const issue = result.issues.find(i => i.type === 'broken_links');
        expect(issue).toBeDefined();
        expect(issue?.affectedPages).toBe(1);
        expect(issue?.severity).toBe('warning');
    });

    it('should identify duplicate titles', async () => {
        const service = new SiteAuditService(mockRepo);
        const result = await service.runAudit('example.com');

        const issue = result.issues.find(i => i.type === 'duplicate_titles');
        expect(issue).toBeDefined();
        expect(issue?.affectedPages).toBe(2);
    });

    it('should identify missing H1s', async () => {
        const service = new SiteAuditService(mockRepo);
        const result = await service.runAudit('example.com');

        const issue = result.issues.find(i => i.type === 'missing_h1');
        expect(issue).toBeDefined();
        expect(issue?.affectedPages).toBe(1);
    });

    it('should identify thin content', async () => {
        const service = new SiteAuditService(mockRepo);
        const result = await service.runAudit('example.com');

        const issue = result.issues.find(i => i.type === 'thin_content');
        expect(issue).toBeDefined();
        expect(issue?.affectedPages).toBe(2);
    });

    it('should identify orphan pages', async () => {
        const service = new SiteAuditService(mockRepo);
        const result = await service.runAudit('example.com');

        const issue = result.issues.find(i => i.type === 'orphan_pages');
        expect(issue).toBeDefined();
        expect(issue?.affectedPages).toBe(1);
    });

    it('should identify missing canonical tags', async () => {
        const service = new SiteAuditService(mockRepo);
        const result = await service.runAudit('example.com');

        const issue = result.issues.find(i => i.type === 'missing_canonical');
        expect(issue).toBeDefined();
        expect(issue?.affectedPages).toBe(1);
    });

    it('should calculate health score correctly', async () => {
        const service = new SiteAuditService(mockRepo);
        const result = await service.runAudit('example.com');

        expect(result.healthScore).toBe(60);
    });
});
