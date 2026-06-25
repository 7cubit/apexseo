import { describe, it, expect } from 'vitest';
import { hasPermission, hasRole, UserRole, Permission } from '../rbac';

describe('RBAC Logic', () => {
    describe('hasPermission', () => {
        it('should allow ADMIN all permissions', () => {
            expect(hasPermission(UserRole.ADMIN, Permission.PROJECT_DELETE)).toBe(true);
        });

        it('should allow USER to create projects', () => {
            expect(hasPermission(UserRole.USER, Permission.PROJECT_CREATE)).toBe(true);
        });

        it('should NOT allow USER to manage users', () => {
            expect(hasPermission(UserRole.USER, Permission.USER_MANAGE)).toBe(false);
        });

        it('should allow VIEWER only read access', () => {
            expect(hasPermission(UserRole.VIEWER, Permission.PROJECT_READ)).toBe(true);
            expect(hasPermission(UserRole.VIEWER, Permission.PROJECT_UPDATE)).toBe(false);
        });
    });

    describe('hasRole Module', () => {
        // Based on the simplified logic in rbac.ts:
        // if (userRole === UserRole.ADMIN) return true;
        // return userRole === requiredRole;

        it('should return true if user is ADMIN regardless of required role', () => {
            expect(hasRole(UserRole.ADMIN, UserRole.USER)).toBe(true);
        });

        it('should return true if roles match', () => {
            expect(hasRole(UserRole.USER, UserRole.USER)).toBe(true);
        });

        it('should return false if roles do not match and user is not ADMIN', () => {
            expect(hasRole(UserRole.VIEWER, UserRole.USER)).toBe(false);
        });
    });
});
