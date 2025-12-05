"use client";

import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';

export const ThemeToggle = () => {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Check if user has manually set a theme
        const storedTheme = localStorage.getItem('vite-ui-theme');

        if (!storedTheme) {
            const hour = new Date().getHours();
            // Day time (6 AM - 6 PM) -> Dark Mode (as requested)
            // Night time -> Light Mode
            if (hour >= 6 && hour < 18) {
                setTheme('dark');
            } else {
                setTheme('light');
            }
        }
    }, [setTheme]);

    if (!mounted) {
        return <div className="w-10 h-10" />; // Placeholder to avoid layout shift
    }

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    return (
        <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full bg-[#151923] border border-gray-800 flex items-center justify-center transition-all duration-200 group hover:border-purple-500/30 hover:bg-purple-500/10"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
            {theme === 'dark' ? (
                <Moon className="w-5 h-5 text-purple-400 group-hover:text-purple-300 transition-colors" />
            ) : (
                <Sun className="w-5 h-5 text-yellow-500 group-hover:text-yellow-400 transition-colors" />
            )}
        </button>
    );
};
