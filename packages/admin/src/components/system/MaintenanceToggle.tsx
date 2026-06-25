"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export function MaintenanceToggle() {
    const [enabled, setEnabled] = useState(false);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/system/maintenance`, { withCredentials: true });
            setEnabled(data.maintenance);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggle = async (checked: boolean) => {
        try {
            setLoading(true);
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/admin/system/maintenance`, { enabled: checked }, { withCredentials: true });
            setEnabled(checked);
            toast({
                title: checked ? "Maintenance Mode Enabled" : "Maintenance Mode Disabled",
                description: checked ? "Non-admin users are now blocked." : "System is live for all users.",
                variant: checked ? "destructive" : "default"
            });
        } catch (err) {
            toast({ title: "Error", description: "Failed to update maintenance mode", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center space-x-2 border p-2 rounded-lg bg-background">
            <Switch id="maintenance-mode" checked={enabled} onCheckedChange={toggle} disabled={loading} />
            <Label htmlFor="maintenance-mode" className="text-sm font-medium">Maintenance Mode</Label>
        </div>
    );
}
