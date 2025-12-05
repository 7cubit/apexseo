import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Calendar, Download, Sparkles, ChevronRight, Home } from 'lucide-react';

interface DashboardHeaderProps {
    projectName: string;
    projectDomain: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ projectName, projectDomain }) => {
    return (
        <div className="mb-8">
            {/* Breadcrumb */}
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                <Link href="/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center">
                    <Home className="w-4 h-4 mr-1" />
                    Dashboard
                </Link>
                <ChevronRight className="w-4 h-4 mx-2" />
                <Link href="/sites" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    Sites
                </Link>
                <ChevronRight className="w-4 h-4 mx-2" />
                <span className="font-medium text-gray-900 dark:text-white">{projectName}</span>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{projectName}</h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Project overview for <span className="text-blue-600 dark:text-blue-400 font-medium">{projectDomain}</span>
                    </p>
                </div>

                <div className="flex gap-3">
                    <Button variant="outline" className="hidden md:flex bg-white dark:bg-[#151923] border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white">
                        <Calendar className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                        Last 30 Days
                    </Button>
                    <Button variant="outline" className="hidden md:flex bg-white dark:bg-[#151923] border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white">
                        <Download className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                        Export
                    </Button>
                    <Link href="/content-studio">
                        <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg shadow-purple-500/20 border-0">
                            <Sparkles className="mr-2 h-4 w-4" />
                            Create Content
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};
