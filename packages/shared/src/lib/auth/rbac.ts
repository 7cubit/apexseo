export enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
    VIEWER = 'viewer'
}

export enum Permission {
    PROJECT_CREATE = 'project:create',
    PROJECT_READ = 'project:read',
    PROJECT_UPDATE = 'project:update',
    PROJECT_DELETE = 'project:delete',
    SITE_CRAWL = 'site:crawl',
    SITE_AUDIT = 'site:audit',
    USER_MANAGE = 'user:manage'
}

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
    [UserRole.ADMIN]: Object.values(Permission),
    [UserRole.USER]: [
        Permission.PROJECT_CREATE,
        Permission.PROJECT_READ,
        Permission.PROJECT_UPDATE,
        Permission.PROJECT_DELETE,
        Permission.SITE_CRAWL,
        Permission.SITE_AUDIT
    ],
    [UserRole.VIEWER]: [
        Permission.PROJECT_READ,
        Permission.SITE_AUDIT
    ]
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
    const permissions = ROLE_PERMISSIONS[role];
    return permissions ? permissions.includes(permission) : false;
}

export function hasRole(userRole: string, requiredRole: UserRole): boolean {
    const roles = Object.values(UserRole);
    const userRoleIndex = roles.indexOf(userRole as UserRole);
    const requiredRoleIndex = roles.indexOf(requiredRole);

    // Simple hierarchy: Admin > User > Viewer
    // Assuming the enum order implies hierarchy or we define it explicitly
    // For now, let's do exact match or admin override
    if (userRole === UserRole.ADMIN) return true;
    return userRole === requiredRole;
}
