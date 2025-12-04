import React from 'react';
import { cn } from '../components/Button';
import { Button } from '../components/Button';
import { LayoutDashboard, BarChart3, Settings, Globe, Link as LinkIcon, Users } from 'lucide-react';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
}

export function Sidebar({ className }: SidebarProps) {
    return (
        <div className={cn("pb-12 w-64 border-r min-h-screen bg-background", className)}>
            <div className={cn("space-y-4 py-4")}>
                <div className={cn("px-3 py-2")}>
                    <h2 className={cn("mb-2 px-4 text-lg font-semibold tracking-tight")}>
                        ApexSEO
                    </h2>
                    <div className={cn("space-y-1")}>
                        <Button variant="secondary" className={cn("w-full justify-start")}>
                            <LayoutDashboard className={cn("mr-2 h-4 w-4")} />
                            Dashboard
                        </Button>
                        <Button variant="ghost" className={cn("w-full justify-start")}>
                            <Globe className={cn("mr-2 h-4 w-4")} />
                            Projects
                        </Button>
                        <Button variant="ghost" className={cn("w-full justify-start")}>
                            <BarChart3 className={cn("mr-2 h-4 w-4")} />
                            Analysis
                        </Button>
                        <Button variant="ghost" className={cn("w-full justify-start")}>
                            <LinkIcon className={cn("mr-2 h-4 w-4")} />
                            Link Building
                        </Button>
                        <Button variant="ghost" className={cn("w-full justify-start")}>
                            <Users className={cn("mr-2 h-4 w-4")} />
                            Team
                        </Button>
                        <Button variant="ghost" className={cn("w-full justify-start")}>
                            <Settings className={cn("mr-2 h-4 w-4")} />
                            Settings
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
