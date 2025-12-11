'use client';

import React from 'react';
import { signOut } from 'next-auth/react';
import {
    Search, Bell as BellIcon, MessageSquare as MessageIcon, User, Settings
} from 'lucide-react';
import { Button, Input } from '@apexseo/ui';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { AdminSidebar } from '@/components/layout/AdminSidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="h-screen w-full overflow-hidden bg-gray-50 dark:bg-[#0B0E14] flex font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
            {/* Unified Sidebar */}
            <AdminSidebar />

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
                {/* Top Bar */}
                <header className="h-20 border-b border-gray-200 dark:border-gray-800/50 bg-white dark:bg-[#0F1219] flex items-center justify-between px-8 sticky top-0 z-40 transition-colors duration-300 shrink-0">
                    <div className="w-96">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                            <Input
                                placeholder="Search users, admins..."
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
                                <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center shadow-lg shadow-red-500/20">
                                    <span className="text-white font-bold text-sm">AD</span>
                                </div>
                                <div className="text-left hidden md:block">
                                    <div className="text-sm font-semibold text-gray-900 dark:text-white leading-none">Admin User</div>
                                    <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">Super Admin</div>
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
                                    <button
                                        onClick={() => signOut({ callbackUrl: '/login' })}
                                        className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors flex items-center"
                                    >
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
