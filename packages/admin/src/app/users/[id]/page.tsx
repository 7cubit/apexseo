'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { api } from '../../../lib/api';
import { useParams } from 'next/navigation';
import { BillingTab } from '@/components/users/BillingTab';
import { CommunicationHistory } from '@/components/users/CommunicationHistory';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function UserDetailPage() {
    const { id } = useParams();
    const { getToken, isLoaded, isSignedIn } = useAuth();

    // Fetch User Details
    const { data: user, isLoading } = useQuery({
        queryKey: ['user', id],
        queryFn: async () => {
            const token = await getToken();
            const { data } = await api.get(`/admin/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return data;
        },
        enabled: isLoaded && isSignedIn && !!id
    });

    if (isLoading) return <div>Loading...</div>;
    if (!user) return <div>User not found</div>;

    return (
        <DashboardLayout>
            <div className="container mx-auto py-10">
                <h1 className="text-2xl font-bold mb-4">User Details</h1>
                <div className="bg-white p-6 rounded shadow mb-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="font-semibold block">Email</label>
                            <div>{user.email}</div>
                        </div>
                        <div>
                            <label className="font-semibold block">Role</label>
                            <div>{user.role}</div>
                        </div>
                        <div>
                            <label className="font-semibold block">Status</label>
                            <div>{user.status}</div>
                        </div>
                        <div>
                            <label className="font-semibold block">Plan</label>
                            <div>{user.plan?.name || 'None'}</div>
                        </div>
                    </div>
                </div>

                <div className="mb-8">
                    <BillingTab userId={id as string} />
                </div>

                <div className="mb-8">
                    <h2 className="text-xl font-bold mb-4">Communication History</h2>
                    <CommunicationHistory emails={user.sentEmails || []} />
                </div>

                <h2 className="text-xl font-bold mb-4">Audit Logs</h2>
                <div className="bg-white rounded shadow overflow-hidden">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left">Action</th>
                                <th className="px-6 py-3 text-left">Resource</th>
                                <th className="px-6 py-3 text-left">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {user.auditLogs?.map((log: any) => (
                                <tr key={log.id} className="border-t">
                                    <td className="px-6 py-4">{log.action}</td>
                                    <td className="px-6 py-4">{log.resource}</td>
                                    <td className="px-6 py-4">{new Date(log.createdAt).toLocaleString()}</td>
                                </tr>
                            ))}
                            {(!user.auditLogs || user.auditLogs.length === 0) && (
                                <tr>
                                    <td colSpan={3} className="px-6 py-4 text-center text-gray-500">No logs found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
}
