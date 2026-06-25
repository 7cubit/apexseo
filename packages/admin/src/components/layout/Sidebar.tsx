'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';

const navItems = [
    { label: 'Dashboard', href: '/' },
    { label: 'Users', href: '/users' },
    { label: 'Products', href: '/products' },
    { label: 'Campaigns', href: '/campaigns' },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
            <div className="p-6">
                <h1 className="text-2xl font-bold">ApexSEO Admin</h1>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                {navItems.map(item => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 ${pathname === item.href ? 'bg-gray-700' : ''
                            }`}
                    >
                        {item.label}
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-700">
                <div className="flex items-center gap-3">
                    <UserButton />
                    <span className="text-sm text-gray-400">Admin User</span>
                </div>
            </div>
        </div>
    );
}
