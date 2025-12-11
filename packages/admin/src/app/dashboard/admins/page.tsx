'use client';

import { Card, Button } from '@apexseo/ui';

export default function AdminsPage() {
    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Admins</h1>
                <Button>Invite Admin</Button>
            </div>

            <Card className="p-12 border-none shadow-sm bg-gray-100/50 dark:bg-[#151923] flex flex-col items-center justify-center text-center">
                <h2 className="text-xl font-semibold mb-2">Admin Management</h2>
                <p className="text-muted-foreground max-w-md">
                    This module is currently under development. Soon you will be able to manage admin roles and permissions here.
                </p>
            </Card>
        </div>
    );
}
