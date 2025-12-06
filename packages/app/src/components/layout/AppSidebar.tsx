'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { twMerge } from 'tailwind-merge';
import {
    LayoutDashboard, Globe, Bell, Activity, Search,
    Network, MessageSquare, Share2, Link as LinkIcon,
    ShieldCheck, FlaskConical, CheckCircle2, Settings,
    Zap, Layers, BarChart3, Menu, GitMerge, FileText,
    ChevronDown, ChevronRight, Facebook, Instagram, Twitter, Linkedin,
    User, ChevronLeft
} from 'lucide-react';

// Navigation Groups (Merged from DashboardLayout)
const NAV_GROUPS = [
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
            { href: '/keywords', icon: Search, label: 'Keyword Research', color: 'text-blue-500' },
            { href: '/serp', icon: Activity, label: 'SERP Analysis', color: 'text-purple-500' },
            { href: '/rank-tracker', icon: Activity, label: 'Rank Tracker', color: 'text-emerald-500' },
            { href: '/competitor-radar', icon: Search, label: 'Competitor Radar', color: 'text-rose-500' },
            { href: '/alerts', icon: Bell, label: 'Alerts', color: 'text-amber-500' },
        ]
    },
    {
        title: 'CONTENT ENGINE',
        items: [
            { href: '/research', icon: Layers, label: 'Topical Map Research', color: 'text-violet-500' },
            { href: '/content/editor', icon: FileText, label: 'Content Editor', color: 'text-pink-500' }, // Updated href
            { href: '/content-optimizer', icon: MessageSquare, label: 'Content Optimizer', color: 'text-pink-500' },
            { href: '/cannibalization', icon: GitMerge, label: 'Cannibalization Check', color: 'text-orange-500' },
            { href: '/analytics', icon: BarChart3, label: 'Keyword Volatility', color: 'text-cyan-500' },
        ]
    },
    {
        title: 'GRAPH AUTHORITY',
        items: [
            { href: '/backlinks', icon: LinkIcon, label: 'Backlink Analysis', color: 'text-indigo-500' },
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

export function AppSidebar() {
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
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                    <span className="text-white font-bold text-lg">A</span>
                </div>
                {!isCollapsed && (
                    <div className="ml-3 overflow-hidden whitespace-nowrap animate-in fade-in duration-300">
                        <span className="text-base font-bold text-gray-900 dark:text-white block leading-none">ApexSEO</span>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium tracking-wider uppercase mt-1 block">Enterprise Suite</span>
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
                                const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
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

            {/* Footer Stats (Only visible when expanded) */}
            {!isCollapsed && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0F1219] shrink-0 animate-in fade-in duration-300">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-500 font-bold">API STATUS (BYOK)</span>
                            <span className="text-gray-400">Est. $1.74</span>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                    <span className="text-gray-500 dark:text-gray-300">OpenAI</span>
                                </div>
                                <span className="text-gray-400 dark:text-gray-500 border-b border-dashed border-gray-300 dark:border-gray-700">$1.24</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                    <span className="text-gray-500 dark:text-gray-300">Perplexity</span>
                                </div>
                                <span className="text-gray-400 dark:text-gray-500 border-b border-dashed border-gray-300 dark:border-gray-700">$0.50</span>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center text-xs">
                            <span className="text-gray-500 uppercase font-bold">Brand Voice</span>
                            <span className="text-purple-500 dark:text-purple-400">Professional SaaS</span>
                        </div>

                        <div className="pt-3 border-t border-gray-200 dark:border-gray-800">
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase mb-2">Follow Us</p>
                            <div className="flex justify-between px-2">
                                <Facebook className="w-4 h-4 text-gray-400 hover:text-blue-600 dark:text-gray-500 dark:hover:text-white cursor-pointer transition-colors" />
                                <Instagram className="w-4 h-4 text-gray-400 hover:text-pink-600 dark:text-gray-500 dark:hover:text-white cursor-pointer transition-colors" />
                                <Twitter className="w-4 h-4 text-gray-400 hover:text-blue-400 dark:text-gray-500 dark:hover:text-white cursor-pointer transition-colors" />
                                <Linkedin className="w-4 h-4 text-gray-400 hover:text-blue-700 dark:text-gray-500 dark:hover:text-white cursor-pointer transition-colors" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
