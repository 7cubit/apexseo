"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { twMerge } from 'tailwind-merge';
import {
    LayoutDashboard, Globe, Bell, Activity, Search,
    Network, MessageSquare, Share2, Link as LinkIcon,
    ShieldCheck, FlaskConical, CheckCircle2, Settings,
    Zap, Layers, BarChart3, Menu, GitMerge, FileText,
    ChevronDown, ChevronRight, Facebook, Instagram, Twitter, Linkedin
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { BYOKStatus } from '@/components/dashboard/BYOKStatus';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { User, MessageSquare as MessageIcon, Bell as BellIcon } from 'lucide-react';

// Navigation Groups
const navGroups = [
    {
        title: 'PROJECT OVERVIEW',
        items: [
            { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', color: 'text-blue-500' },
            { href: '/projects', icon: Layers, label: 'Projects', color: 'text-indigo-500' },
            { href: '/sites', icon: Globe, label: 'Sites', color: 'text-indigo-500' },
        ]
    },
    {
        title: 'SEARCH INTELLIGENCE',
        items: [
            { href: '/rank-tracker', icon: Activity, label: 'Rank Tracker', color: 'text-emerald-500' },
            { href: '/competitor-radar', icon: Search, label: 'Competitor Radar', color: 'text-rose-500' },
            { href: '/alerts', icon: Bell, label: 'Alerts', color: 'text-amber-500' },
        ]
    },
    {
        title: 'CONTENT ENGINE',
        items: [
            { href: '/clusters', icon: Layers, label: 'Topic Clusters', color: 'text-violet-500' },
            { href: '/content-optimizer', icon: MessageSquare, label: 'Content Optimizer', color: 'text-pink-500' },
            { href: '/cannibalization', icon: GitMerge, label: 'Cannibalization Check', color: 'text-orange-500' },
            { href: '/analytics', icon: BarChart3, label: 'Keyword Volatility', color: 'text-cyan-500' },
        ]
    },
    {
        title: 'GRAPH AUTHORITY',
        items: [
            { href: '/link-architecture', icon: Share2, label: 'Link Architecture', color: 'text-cyan-500' },
            { href: '/linking', icon: LinkIcon, label: 'Internal Linking', color: 'text-teal-500' },
            { href: '/pagerank', icon: Network, label: 'PageRank Analysis', color: 'text-green-500' },
        ]
    },
    {
        title: 'TECHNICAL HEALTH',
        items: [
            { href: '/audit', icon: ShieldCheck, label: 'Site Audit', color: 'text-red-500' },
            { href: '/ux-lab', icon: FlaskConical, label: 'UX Lab', color: 'text-fuchsia-500' },
        ]
    },
    {
        title: 'AUTOMATION',
        items: [
            { href: '/workflows', icon: Zap, label: 'Workflows', color: 'text-yellow-500' },
            { href: '/recommendations', icon: CheckCircle2, label: 'Recommendations', color: 'text-lime-500' },
            { href: '/wordpress', icon: FileText, label: 'WordPress', color: 'text-blue-700' },
        ]
    },
];

const NavItem = ({ href, icon: Icon, label, color }: { href: string; icon: any; label: string; color?: string }) => {
    const pathname = usePathname();
    const active = pathname === href || pathname?.startsWith(`${href}/`);

    return (
        <Link
            href={href}
            className={twMerge(
                "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 mb-1 group relative overflow-hidden",
                active
                    ? "bg-blue-600/10 text-blue-500"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50"
            )}
        >
            <Icon className={twMerge(
                "w-4 h-4 mr-3 relative z-10 transition-colors",
                active ? "text-blue-500" : (color || "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300")
            )} />
            <span className="relative z-10">{label}</span>
        </Link>
    );
};

const NavGroup = ({
    group,
    isOpen,
    onToggle
}: {
    group: typeof navGroups[0];
    isOpen: boolean;
    onToggle: () => void;
}) => {
    return (
        <div className="mb-4">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
                {group.title}
                {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>

            <div className={twMerge(
                "space-y-0.5 overflow-hidden transition-all duration-300 ease-in-out",
                isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
            )}>
                {group.items.map((item) => (
                    <NavItem key={item.href} {...item} />
                ))}
            </div>
        </div>
    );
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [openGroup, setOpenGroup] = useState<string>('PROJECT OVERVIEW');

    const handleToggle = (title: string) => {
        setOpenGroup(prev => prev === title ? title : title);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0B0E14] flex font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
            {/* Sidebar */}
            <aside className="w-72 border-r border-gray-200 dark:border-gray-800/50 bg-white dark:bg-[#0F1219] flex flex-col fixed h-full z-50 transition-colors duration-300">
                {/* Logo Area */}
                <div className="h-20 flex items-center px-6 border-b border-gray-200 dark:border-gray-800/50">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center mr-3 shadow-lg shadow-blue-500/20">
                        <span className="text-white font-bold text-xl">A</span>
                    </div>
                    <div>
                        <span className="text-lg font-bold text-gray-900 dark:text-white tracking-tight block leading-none">ApexSEO</span>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium tracking-wider uppercase mt-1 block">Enterprise Suite</span>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar">
                    {navGroups.map((group, index) => (
                        <NavGroup
                            key={index}
                            group={group}
                            isOpen={openGroup === group.title}
                            onToggle={() => handleToggle(group.title)}
                        />
                    ))}
                </div>

                {/* Footer Stats & Brand */}
                <BYOKStatus />
            </aside>

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col ml-72 min-w-0">
                {/* Top Bar */}
                <header className="h-20 border-b border-gray-200 dark:border-gray-800/50 bg-white dark:bg-[#0F1219] flex items-center justify-between px-8 sticky top-0 z-40 transition-colors duration-300">
                    <div className="w-96">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                            <Input
                                placeholder="Search projects, keywords, or URLs..."
                                className="pl-10 h-10 bg-gray-50 dark:bg-[#151923] border-gray-200 dark:border-gray-800 focus:border-blue-500/50 focus:ring-blue-500/20 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 rounded-xl"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <ThemeToggle />

                        <div className="h-8 w-px bg-gray-200 dark:bg-gray-800 mx-2"></div>

                        <button className="relative w-10 h-10 rounded-xl bg-gray-50 dark:bg-[#151923] border border-gray-200 dark:border-gray-800 flex items-center justify-center transition-all duration-200 group hover:border-yellow-500/30 hover:bg-yellow-500/10" title="Notifications">
                            <BellIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-yellow-500 transition-colors" />
                            <span className="absolute top-2 right-2.5 w-2 h-2 bg-yellow-500 rounded-full border-2 border-white dark:border-[#151923]"></span>
                        </button>

                        <button className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-[#151923] border border-gray-200 dark:border-gray-800 flex items-center justify-center transition-all duration-200 group hover:border-blue-500/30 hover:bg-blue-500/10" title="Messages">
                            <MessageIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-blue-500 transition-colors" />
                        </button>

                        <div className="relative group ml-2">
                            <button className="flex items-center gap-3 pl-1 pr-2 py-1 rounded-xl hover:bg-gray-50 dark:hover:bg-[#151923] transition-colors border border-transparent hover:border-gray-200 dark:border-gray-800">
                                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                    <span className="text-white font-bold text-sm">DB</span>
                                </div>
                                <div className="text-left hidden md:block">
                                    <div className="text-sm font-semibold text-gray-900 dark:text-white leading-none">David B.</div>
                                    <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">Admin</div>
                                </div>
                            </button>

                            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#1A1F2B] border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden transform origin-top-right">
                                <div className="p-1">
                                    <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center">
                                        <User className="w-4 h-4 mr-2" />
                                        Profile
                                    </button>
                                    <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center">
                                        <Settings className="w-4 h-4 mr-2" />
                                        Settings
                                    </button>
                                    <div className="h-px bg-gray-200 dark:bg-gray-800 my-1"></div>
                                    <button className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors flex items-center">
                                        <div className="w-4 h-4 mr-2" />
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-8 bg-gray-50 dark:bg-[#0B0E14] transition-colors duration-300">
                    {children}
                </main>
            </div>
        </div>
    );
}
