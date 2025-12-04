"use client";

import { api } from "@/lib/api";
import { Button } from "@apexseo/ui";

export default function DashboardPage() {
    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-card rounded-lg border shadow-sm">
                    <h3 className="font-semibold mb-2">Users</h3>
                    <p className="text-2xl font-bold">--</p>
                </div>
                <div className="p-6 bg-card rounded-lg border shadow-sm">
                    <h3 className="font-semibold mb-2">Projects</h3>
                    <p className="text-2xl font-bold">--</p>
                </div>
                <div className="p-6 bg-card rounded-lg border shadow-sm">
                    <h3 className="font-semibold mb-2">System Health</h3>
                    <p className="text-2xl font-bold text-green-500">Healthy</p>
                </div>
            </div>
        </div>
    );
}
