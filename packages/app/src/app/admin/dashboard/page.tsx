'use client';

import { useAdminAuthStore } from '@/lib/stores/admin-auth-store';
import { Card } from '@apexseo/ui';

export default function AdminDashboardPage() {
    const { admin } = useAdminAuthStore();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <div className="text-sm text-gray-500">
                    Welcome back, <span className="font-semibold text-gray-900">{admin?.email}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 space-y-2">
                    <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
                    <p className="text-3xl font-bold text-gray-900">1,234</p>
                    <p className="text-xs text-green-600 flex items-center">
                        <span className="mr-1">↑</span> 12% from last month
                    </p>
                </Card>

                <Card className="p-6 space-y-2">
                    <h3 className="text-sm font-medium text-gray-500">Active Projects</h3>
                    <p className="text-3xl font-bold text-gray-900">856</p>
                    <p className="text-xs text-green-600 flex items-center">
                        <span className="mr-1">↑</span> 5% from last month
                    </p>
                </Card>

                <Card className="p-6 space-y-2">
                    <h3 className="text-sm font-medium text-gray-500">System Status</h3>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                        <p className="text-lg font-medium text-gray-900">All Systems Operational</p>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">New user registration</p>
                                    <p className="text-xs text-gray-500">user_{i}@example.com joined the platform</p>
                                </div>
                                <span className="text-xs text-gray-400">2 mins ago</span>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button className="p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                            <span className="block text-sm font-medium text-gray-900">Invite User</span>
                            <span className="text-xs text-gray-500">Send an invitation email</span>
                        </button>
                        <button className="p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                            <span className="block text-sm font-medium text-gray-900">System Logs</span>
                            <span className="text-xs text-gray-500">View recent system events</span>
                        </button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
