'use client';

import { Card, Button, Input } from '@apexseo/ui';

export default function SettingsPage() {
    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            </div>

            <div className="grid gap-6">
                <Card className="p-6 border-none shadow-sm bg-gray-100/50 dark:bg-[#151923]">
                    <h2 className="text-lg font-semibold mb-4">General Configuration</h2>
                    <div className="space-y-4 max-w-xl">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Application Name</label>
                            <Input defaultValue="ApexSEO" />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Support Email</label>
                            <Input defaultValue="support@apexseo.com" />
                        </div>
                        <Button>Save Changes</Button>
                    </div>
                </Card>

                <Card className="p-6 border-none shadow-sm bg-gray-100/50 dark:bg-[#151923]">
                    <h2 className="text-lg font-semibold mb-4">Security</h2>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Two-Factor Authentication</p>
                            <p className="text-sm text-muted-foreground">Enforce 2FA for all admin accounts.</p>
                        </div>
                        <Button variant="outline">Configure</Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
