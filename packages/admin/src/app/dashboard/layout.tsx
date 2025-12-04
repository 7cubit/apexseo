'use client';

import { Sidebar } from '@apexseo/ui';
import { useRouter, usePathname } from 'next/navigation';
import { CreditCard } from 'lucide-react';
import { api } from '@/lib/api';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = async () => {
        try {
            await api.post("/admin/auth/logout");
            router.push("/login");
        } catch (err) {
            console.error("Logout failed", err);
        }
    };

    const navItems = [
        { label: 'Overview', href: '/dashboard', active: pathname === '/dashboard' },
        { label: 'Users', href: '/dashboard/users', active: pathname.startsWith('/dashboard/users') },
        { label: 'Admins', href: '/dashboard/admins', active: pathname.startsWith('/dashboard/admins') },
        { label: 'Settings', href: '/dashboard/settings', active: pathname.startsWith('/dashboard/settings') },
    ];

    return (
        <div className="flex h-screen bg-background">
            <div className="w-64 border-r bg-card">
                <div className="p-6 border-b">
                    <h1 className="text-xl font-bold">ApexSEO Admin</h1>
                </div>
                <nav className="p-4 space-y-2">
                    {navItems.map((item) => (
                        <button
                            key={item.href}
                            onClick={() => router.push(item.href)}
                            className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${item.active
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                }`}
                        >
                            {item.label}
                        </button>
                    ))}
                    <div className="pt-4 mt-4 border-t">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </nav>
            </div>
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
