'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Flag, Settings, Shield, Server } from 'lucide-react';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const navItems = [
        { name: 'Feature Flags', href: '/admin/settings/flags', icon: Flag },
        { name: 'System Limits', href: '/admin/settings/limits', icon: Shield },
        { name: 'Integrations & Maintenance', href: '/admin/settings/general', icon: Server },
    ];

    return (
        <div className="flex flex-col md:flex-row gap-6">
            <aside className="w-full md:w-64 shrink-0">
                <nav className="space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${isActive
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-blue-500' : 'text-gray-400'}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </aside>
            <main className="flex-1 min-w-0">
                {children}
            </main>
        </div>
    );
}
