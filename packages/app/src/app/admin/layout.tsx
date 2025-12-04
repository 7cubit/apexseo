'use client';

import { useAdminAuthStore } from '@/lib/stores/admin-auth-store';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@apexseo/ui';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated, logout, isLoading } = useAdminAuthStore();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // If not authenticated and not on login page, redirect to login
        if (!isAuthenticated && pathname !== '/admin/login') {
            router.push('/admin/login');
        }
        // If authenticated and on login page, redirect to dashboard
        if (isAuthenticated && pathname === '/admin/login') {
            router.push('/admin/dashboard');
        }
    }, [isAuthenticated, pathname, router]);

    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    if (!isAuthenticated) {
        return null; // Or a loading spinner
    }

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md flex flex-col">
                <div className="p-6 border-b">
                    <h1 className="text-xl font-bold text-gray-800">ApexSEO Admin</h1>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <Link
                        href="/admin/dashboard"
                        className={`block px-4 py-2 rounded-md ${pathname === '/admin/dashboard'
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        Dashboard
                    </Link>
                    <Link
                        href="/admin/accounts"
                        className={`block px-4 py-2 rounded-md ${pathname.startsWith('/admin/accounts')
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        Accounts
                    </Link>
                    <Link
                        href="/admin/plans/builder"
                        className={`block px-4 py-2 rounded-md ${pathname === '/admin/plans/builder'
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        Plan Builder
                    </Link>
                    <Link
                        href="/admin/audit-logs"
                        className={`block px-4 py-2 rounded-md ${pathname === '/admin/audit-logs'
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        Audit Logs
                    </Link>
                    <Link
                        href="/admin/system"
                        className={`block px-4 py-2 rounded-md ${pathname === '/admin/system'
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        System Health
                    </Link>
                    <Link
                        href="/admin/projects"
                        className={`block px-4 py-2 rounded-md ${pathname === '/admin/projects'
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        Projects
                    </Link>
                    <Link
                        href="/admin/api-usage"
                        className={`block px-4 py-2 rounded-md ${pathname === '/admin/api-usage'
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        API Analytics
                    </Link>
                    <Link
                        href="/admin/users"
                        className={`block px-4 py-2 rounded-md ${pathname === '/admin/users'
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        Users
                    </Link>
                    <Link
                        href="/admin/settings/flags"
                        className={`block px-4 py-2 rounded-md ${pathname.startsWith('/admin/settings')
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        Settings
                    </Link>
                </nav>
                <div className="p-4 border-t">
                    <Button
                        variant="outline"
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                            logout();
                            router.push('/admin/login');
                        }}
                    >
                        Logout
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
