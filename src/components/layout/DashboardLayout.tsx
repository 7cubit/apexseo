"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { twMerge } from 'tailwind-merge';
import {
    Folder, Globe, Share2, Network, Link as LinkIcon,
    ShieldCheck, FlaskConical, Settings, Search, Bell,
    MessageSquare, User
} from 'lucide-react';
import { Input } from '@/components/ui/input';

const NavItem = ({ href, icon: Icon, label }: { href: string; icon: any; label: string }) => {
    const pathname = usePathname();
    const active = pathname === href || pathname?.startsWith(`${href}/`);

    return (
        <Link
            href={href}
            className={twMerge(
                "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-1",
                active
                    ? "bg-blue-600/10 text-blue-400"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
            )}
        >
            <Icon className="w-5 h-5" />
            <span className="ml-3">{label}</span>
        </Link>
    );
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#0B0E14] flex font-sans text-gray-100">
            {/* Sidebar */}
            <aside className="w-64 border-r border-gray-800/50 bg-[#0B0E14] flex flex-col fixed h-full z-50">
                <div className="h-16 flex items-center px-6 border-b border-gray-800/50">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center mr-3">
                        <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    </div>
                    <span className="text-xl font-bold text-white tracking-tight">APEXSEO</span>
                </div>

                <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                    <NavItem href="/dashboard" icon={Folder} label="Dashboard" />
                    <NavItem href="/sites" icon={Globe} label="Sites" />
                    <NavItem href="/clusters" icon={Network} label="Clusters" />
                    <NavItem href="/linking" icon={LinkIcon} label="Linking" />
                    <NavItem href="/truth" icon={ShieldCheck} label="Truth" />
                    <NavItem href="/ux-lab" icon={FlaskConical} label="UX Lab" />
                    <NavItem href="/settings" icon={Settings} label="Settings" />
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col ml-64 min-w-0">
                {/* Top Bar */}
                <header className="h-16 border-b border-gray-800/50 bg-[#0B0E14] flex items-center justify-between px-8 sticky top-0 z-40">
                    <div className="w-96">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <Input
                                placeholder="Search projects..."
                                className="pl-10 bg-gray-900/50 border-gray-800 focus:border-blue-500/50 focus:ring-blue-500/20"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                            <Bell className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                            <MessageSquare className="w-5 h-5" />
                        </button>
                        <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 border border-gray-700">
                            <User className="w-4 h-4" />
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-8 bg-[#0B0E14]">
                    {children}
                </main>
            </div>
        </div>
    );
}
