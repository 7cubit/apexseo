'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { RefundModal } from '../billing/RefundModal';
import { Button } from '../ui/button';
import { FileText, RotateCcw } from 'lucide-react';

interface Invoice {
    id: string;
    amountPaid: string;
    status: string;
    invoicePdfUrl?: string;
    createdAt: string;
    refunds: any[];
}

export const BillingTab: React.FC<{ userId: string }> = ({ userId }) => {
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

    const { data: invoices, isLoading, refetch } = useQuery({
        queryKey: ['invoices', userId],
        queryFn: async () => {
            const res = await api.get<Invoice[]>(`/admin/billing/users/${userId}/invoices`);
            return res.data;
        }
    });

    if (isLoading) return <div>Loading billing history...</div>;

    if (!invoices || invoices.length === 0) {
        return <div className="text-gray-500">No invoices found for this user.</div>;
    }

    return (
        <div>
            <h3 className="text-lg font-semibold mb-4">Billing History</h3>
            <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100 border-b">
                        <tr>
                            <th className="px-4 py-2">Date</th>
                            <th className="px-4 py-2">ID</th>
                            <th className="px-4 py-2">Amount</th>
                            <th className="px-4 py-2">Status</th>
                            <th className="px-4 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.map((inv) => (
                            <tr key={inv.id} className="border-b last:border-0 hover:bg-gray-50">
                                <td className="px-4 py-2">{new Date(inv.createdAt).toLocaleDateString()}</td>
                                <td className="px-4 py-2 font-mono text-xs">{inv.id}</td>
                                <td className="px-4 py-2">${inv.amountPaid}</td>
                                <td className="px-4 py-2 capitalize">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium 
                                        ${inv.status === 'PAID' ? 'bg-green-100 text-green-700' :
                                            inv.status === 'OPEN' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-200 text-gray-700'}`}>
                                        {inv.status.toLowerCase()}
                                    </span>
                                </td>
                                <td className="px-4 py-2 flex gap-2">
                                    {inv.invoicePdfUrl && (
                                        <a href={inv.invoicePdfUrl} target="_blank" rel="noreferrer" title="Download PDF">
                                            <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                                                <FileText className="h-4 w-4" />
                                            </Button>
                                        </a>
                                    )}
                                    {inv.status === 'PAID' && (
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            className="h-8 w-8 p-0"
                                            onClick={() => setSelectedInvoice(inv)}
                                            title="Refund"
                                        >
                                            <RotateCcw className="h-4 w-4" />
                                        </Button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedInvoice && (
                <RefundModal
                    invoiceId={selectedInvoice.id}
                    amountPaid={Number(selectedInvoice.amountPaid)}
                    isOpen={!!selectedInvoice}
                    onClose={() => setSelectedInvoice(null)}
                    onSuccess={() => {
                        refetch();
                    }}
                />
            )}
        </div>
    );
};
