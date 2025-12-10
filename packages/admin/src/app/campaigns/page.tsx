'use client';

import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';
import { CreateCampaignModal } from '../../components/campaigns/CreateCampaignModal';

// Types (should be shared)
type Campaign = {
    id: string;
    name: string;
    subject: string;
    status: 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'COMPLETED' | 'FAILED';
    totalSent: number;
    openCount: number;
    clickCount: number;
    createdAt: string;
};

export const dynamic = 'force-dynamic';

export default function CampaignsPage() {
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const { data: campaigns, isLoading } = useQuery<Campaign[]>({
        queryKey: ['campaigns'],
        queryFn: async () => {
            // Adjust API URL if needed. Assuming proxy or absolute URL.
            // Admin pkg often runs on 3002, API on 3001. 
            // Env var NEXT_PUBLIC_API_URL should be used.
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/campaigns`);
            return res.data;
        }
    });

    const sendMutation = useMutation({
        mutationFn: async (id: string) => {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/campaigns/${id}/send`);
        },
        onSuccess: () => {
            alert('Sending started!');
            queryClient.invalidateQueries({ queryKey: ['campaigns'] });
        }
    });

    return (
        <DashboardLayout>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Email Campaigns</h1>
                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Create Campaign
                </button>
            </div>

            {isLoading ? (
                <div>Loading...</div>
            ) : (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opens</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {campaigns?.map(campaign => (
                                <tr key={campaign.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                                        <div className="text-sm text-gray-500">{campaign.subject}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${campaign.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                campaign.status === 'SENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-gray-100 text-gray-800'}`}>
                                            {campaign.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campaign.totalSent}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {campaign.openCount} ({campaign.totalSent > 0 ? Math.round((campaign.openCount / campaign.totalSent) * 100) : 0}%)
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {campaign.clickCount} ({campaign.openCount > 0 ? Math.round((campaign.clickCount / campaign.openCount) * 100) : 0}%)
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {campaign.status === 'DRAFT' && (
                                            <button
                                                onClick={() => sendMutation.mutate(campaign.id)}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                Send
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {isCreateOpen && (
                <CreateCampaignModal onClose={() => setIsCreateOpen(false)} />
            )}
        </DashboardLayout>
    );
}
