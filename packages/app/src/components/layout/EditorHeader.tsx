'use client';

import React from 'react';
import { useEditorStore } from '@/stores/editorStore';
import {
    HelpCircle, Bell, User, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function EditorHeader() {
    const { primaryKeyword } = useEditorStore();

    return (
        <header className="h-14 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0F1219] flex items-center justify-between px-6 z-40">
            {/* Left: Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="hover:text-blue-600 cursor-pointer transition-colors">apexseo.com</span>
                <span className="text-gray-300">/</span>
                <span className="flex items-center gap-2">
                    <span className="text-lg">🇺🇸</span>
                    <span className="text-gray-900 dark:text-white font-medium">{primaryKeyword || 'Untitled'}</span>
                </span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-4">
                <div className="flex flex-col items-end mr-2">
                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Improve</span>
                    <span className="text-xs font-bold text-gray-900 dark:text-white leading-none">APEXSEO</span>
                </div>

                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    <HelpCircle className="w-5 h-5" />
                </button>

                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
                </button>

                <button className="p-1 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <User className="w-5 h-5 text-gray-500" />
                </button>
            </div>
        </header>
    );
}
