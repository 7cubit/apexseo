"use client";

import { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@apexseo/ui/components/dialog";
import { Button } from "@apexseo/ui/components/button";
import { ScrollArea } from "@apexseo/ui/components/scroll-area";
import { Badge } from "@apexseo/ui/components/badge";

const CHANGELOG = [
    {
        version: "1.2.0",
        date: "2024-12-10",
        title: "System Health & Safety",
        changes: [
            "New System Health Dashboard",
            "Maintenance Mode Toggle",
            "Redis-backed Rate Limiting",
            "Enhanced Security Audit Logging"
        ]
    },
    {
        version: "1.1.0",
        date: "2024-12-05",
        title: "CRM & Email",
        changes: [
            "Email Campaign Builder",
            "User Segmentation",
            "Stripe Integration for Billing"
        ]
    }
];

export function WhatsNewModal() {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const lastSeen = localStorage.getItem('apexseo_admin_changelog_seen');
        const latestVersion = CHANGELOG[0].version;
        if (lastSeen !== latestVersion) {
            setOpen(true);
        }
    }, []);

    const handleClose = () => {
        setOpen(false);
        localStorage.setItem('apexseo_admin_changelog_seen', CHANGELOG[0].version);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        What's New in ApexSEO
                        <Badge variant="secondary">v{CHANGELOG[0].version}</Badge>
                    </DialogTitle>
                    <DialogDescription>
                        Configuration and system updates.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                    {CHANGELOG.map((release, i) => (
                        <div key={i} className="mb-6 last:mb-0">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold">{release.title}</h3>
                                <span className="text-xs text-muted-foreground">{release.date}</span>
                            </div>
                            <ul className="list-disc pl-4 space-y-1 text-sm">
                                {release.changes.map((change, j) => (
                                    <li key={j}>{change}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </ScrollArea>
                <div className="flex justify-end mt-4">
                    <Button onClick={handleClose}>Got it</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
