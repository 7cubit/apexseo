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
    const [isCollapsed, setIsCollapsed] = useState(true); // Default to collapsed for minimalist focus
    const pathname = usePathname();

    return (
        <aside
            className={twMerge(
                "h-full bg-editor-surface border-r border-border/50 flex flex-col transition-all duration-300 relative shrink-0 z-50",
                isCollapsed ? "w-16" : "w-64"
            )}
        >
            {/* Toggle Button */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-8 w-6 h-6 bg-editor-surface border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground z-50 shadow-depth-sm cursor-pointer hover:scale-110 transition-all duration-200"
                title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
                {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
            </button>

            {/* Header / Logo */}
            <div className="h-20 flex items-center px-4 border-b border-border/50 shrink-0">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0 shadow-depth-sm">
                    <span className="text-primary-foreground font-bold text-lg">A</span>
                </div>
                {!isCollapsed && (
                    <div className="ml-3 overflow-hidden whitespace-nowrap animate-in fade-in duration-300">
                        <span className="text-base font-bold text-foreground block leading-none">ApexSEO</span>
                        <span className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase mt-1 block">Enterprise Suite</span>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-6 custom-scrollbar">
                {NAV_GROUPS.map((group, groupIndex) => (
                    <div key={groupIndex} className="mb-6">
                        {!isCollapsed && (
                            <h3 className="px-6 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 whitespace-nowrap animate-in fade-in duration-300">
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
                                                ? "bg-primary/10 text-primary"
                                                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                                        )}
                                        title={isCollapsed ? item.label : undefined}
                                    >
                                        <item.icon className={twMerge(
                                            "shrink-0 transition-colors",
                                            isCollapsed ? "w-5 h-5" : "w-4 h-4 mr-3",
                                            isActive ? "text-primary" : (item.color || "text-muted-foreground group-hover:text-foreground")
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
                <div className="p-4 border-t border-border/50 bg-secondary/30 shrink-0 animate-in fade-in duration-300">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-muted-foreground font-bold">API STATUS (BYOK)</span>
                            <span className="text-muted-foreground/70">Est. $1.74</span>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                    <span className="text-foreground/80">OpenAI</span>
                                </div>
                                <span className="text-muted-foreground border-b border-dashed border-border">$1.24</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                    <span className="text-foreground/80">Perplexity</span>
                                </div>
                                <span className="text-muted-foreground border-b border-dashed border-border">$0.50</span>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-border/50 flex justify-between items-center text-xs">
                            <span className="text-muted-foreground uppercase font-bold">Brand Voice</span>
                            <span className="text-primary">Professional SaaS</span>
                        </div>

                        <div className="pt-3 border-t border-border/50">
                            <p className="text-[10px] text-muted-foreground font-bold uppercase mb-2">Follow Us</p>
                            <div className="flex justify-between px-2">
                                <Facebook className="w-4 h-4 text-muted-foreground hover:text-blue-500 cursor-pointer transition-colors" />
                                <Instagram className="w-4 h-4 text-muted-foreground hover:text-pink-500 cursor-pointer transition-colors" />
                                <Twitter className="w-4 h-4 text-muted-foreground hover:text-blue-400 cursor-pointer transition-colors" />
                                <Linkedin className="w-4 h-4 text-muted-foreground hover:text-blue-600 cursor-pointer transition-colors" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer Icon Mode (Only visible when collapsed) */}
            {isCollapsed && (
                <div className="p-4 border-t border-border/50 bg-secondary/30 shrink-0 flex flex-col items-center gap-4 animate-in fade-in duration-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" title="System Operational"></div>
                    <User className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer" />
                </div>
            )}
        </aside>
    );
}
