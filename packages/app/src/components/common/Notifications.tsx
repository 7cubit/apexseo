"use client";

import React from 'react';
import { Bell } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import useSWR from 'swr';

interface Alert {
    id: string;
    type: 'error' | 'warning' | 'info';
    message: string;
    created_at: string;
    is_read: number;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function Notifications() {
    // Poll for alerts every minute
    const { data: alerts, mutate } = useSWR<Alert[]>('/api/alerts?limit=5', fetcher, { refreshInterval: 60000 });

    const unreadCount = alerts?.filter(a => !a.is_read).length || 0;

    const markAsRead = async (id: string) => {
        // For MVP, we assume 'example.com' or we need to pass siteId to this component
        // Ideally, the alert object should contain site_id so we can pass it back
        const alert = alerts?.find(a => a.id === id);
        if (!alert) return;

        await fetch(`/api/alerts/${id}/read`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ siteId: 'example.com' }) // TODO: Use alert.site_id if available or prop
        });
        mutate(); // Refresh
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 rounded-full bg-red-500 text-white text-xs">
                            {unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {!alerts || alerts.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                        No new notifications
                    </div>
                ) : (
                    alerts.map(alert => (
                        <DropdownMenuItem key={alert.id} className="flex flex-col items-start p-3 cursor-pointer" onClick={() => markAsRead(alert.id)}>
                            <div className="flex w-full justify-between items-center mb-1">
                                <span className={`text-xs font-bold uppercase ${alert.type === 'error' ? 'text-red-500' :
                                    alert.type === 'warning' ? 'text-yellow-500' : 'text-blue-500'
                                    }`}>
                                    {alert.type}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {new Date(alert.created_at).toLocaleTimeString()}
                                </span>
                            </div>
                            <p className={`text-sm ${alert.is_read ? 'text-muted-foreground' : 'font-medium'}`}>
                                {alert.message}
                            </p>
                        </DropdownMenuItem>
                    ))
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
