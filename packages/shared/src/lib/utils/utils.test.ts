import { logger } from './logger';
import { dateUtils } from './date';
import { validators } from './validation';
import { describe, it, expect, vi } from 'vitest';

describe('Utilities', () => {
    describe('Logger', () => {
        it('should log messages', () => {
            const spy = vi.spyOn(console, 'info').mockImplementation(() => { });
            logger.info('test message');
            expect(spy).toHaveBeenCalled();
            spy.mockRestore();
        });
    });

    describe('Date Utils', () => {
        it('should format dates', () => {
            const date = new Date('2023-01-01T00:00:00Z');
            expect(dateUtils.formatDate(date)).toBe('2023-01-01');
        });
    });

    describe('Validators', () => {
        it('should validate emails', () => {
            expect(validators.validate(validators.email, 'test@example.com').success).toBe(true);
            expect(validators.validate(validators.email, 'invalid-email').success).toBe(false);
        });
    });
});
