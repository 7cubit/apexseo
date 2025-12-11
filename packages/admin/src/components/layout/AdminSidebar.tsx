'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { twMerge } from 'tailwind-merge';
import {
    LayoutDashboard, Users, ShieldCheck, Settings,
    ChevronRight, ChevronLeft, Facebook, Instagram, Twitter, Linkedin,
    User
} from 'lucide-react';

// Admin Navigation Groups
const NAV_GROUPS = [
    {
        title: 'MANAGEMENT',
        items: [
            { href: '/dashboard', icon: LayoutDashboard, label: 'Overview', color: 'text-blue-500' },
            { href: '/dashboard/users', icon: Users, label: 'Users', color: 'text-indigo-500' },
            { href: '/dashboard/subscriptions', icon: LayoutDashboard, label: 'Subscriptions', color: 'text-violet-500' },
            { href: '/dashboard/admins', icon: ShieldCheck, label: 'Admins', color: 'text-emerald-500' },
        ]
    },
    {
        title: 'CONFIGURATION',
        items: [
            { href: '/dashboard/settings', icon: Settings, label: 'Settings', color: 'text-gray-500' },
        ]
    }
];

export function AdminSidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname();

    return (
        <aside
            className={twMerge(
                "h-full bg-white dark:bg-[#0B0E14] border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300 relative shrink-0 z-50",
                isCollapsed ? "w-16" : "w-64"
            )}
        >
            {/* Toggle Button */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-8 w-6 h-6 bg-white dark:bg-[#0B0E14] border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-white z-50 shadow-md cursor-pointer hover:scale-110 transition-transform"
                title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
                {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
            </button>

            {/* Header / Logo */}
            <div className="h-20 flex items-center px-4 border-b border-gray-200 dark:border-gray-800/50 shrink-0">
                <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center shrink-0 shadow-lg shadow-red-500/20">
                    <span className="text-white font-bold text-lg">A</span>
                </div>
                {!isCollapsed && (
                    <div className="ml-3 overflow-hidden whitespace-nowrap animate-in fade-in duration-300">
                        <span className="text-base font-bold text-gray-900 dark:text-white block leading-none">ApexSEO</span>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium tracking-wider uppercase mt-1 block">Admin Console</span>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-6 custom-scrollbar">
                {NAV_GROUPS.map((group, groupIndex) => (
                    <div key={groupIndex} className="mb-6">
                        {!isCollapsed && (
                            <h3 className="px-6 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 whitespace-nowrap animate-in fade-in duration-300">
                                {group.title}
                            </h3>
                        )}
                        <div className="space-y-0.5 px-3">
                            {group.items.map((item, itemIndex) => {
                                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(`${item.href}`));
                                return (
                                    <Link
                                        key={itemIndex}
                                        href={item.href}
                                        className={twMerge(
                                            "flex items-center rounded-lg transition-colors duration-200 group relative",
                                            isCollapsed ? "justify-center p-2" : "px-3 py-2",
                                            isActive
                                                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/50"
                                        )}
                                        title={isCollapsed ? item.label : undefined}
                                    >
                                        <item.icon className={twMerge(
                                            "shrink-0 transition-colors",
                                            isCollapsed ? "w-5 h-5" : "w-4 h-4 mr-3",
                                            isActive ? "text-blue-600 dark:text-blue-400" : (item.color || "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300")
                                        )} />
                                        {!isCollapsed && (
                                            <span className="text-sm font-medium whitespace-nowrap animate-in fade-in duration-300">{item.label}</span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer Icon Mode (Only visible when collapsed) */}
            {isCollapsed && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0F1219] shrink-0 flex flex-col items-center gap-4 animate-in fade-in duration-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" title="System Operational"></div>
                    <User className="w-4 h-4 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white cursor-pointer" />
                </div>
            )}
        </aside>
    );
}
