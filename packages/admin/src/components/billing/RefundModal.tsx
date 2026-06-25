'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '../ui/button';

interface RefundModalProps {
    invoiceId: string;
    amountPaid: number;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const RefundModal: React.FC<RefundModalProps> = ({ invoiceId, amountPaid, isOpen, onClose, onSuccess }) => {
    const [amount, setAmount] = useState<number | ''>(amountPaid);
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleRefund = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await api.post('/admin/billing/refunds', {
                invoiceId,
                amount: Number(amount),
                reason
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Refund failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
                <h3 className="text-lg font-bold mb-4">Issue Refund</h3>
                {error && <div className="text-red-500 mb-2 text-sm">{error}</div>}

                <form onSubmit={handleRefund}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Amount ($)</label>
                        <input
                            type="number"
                            step="0.01"
                            max={amountPaid}
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            className="w-full border rounded px-3 py-2"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Reason (Optional)</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full border rounded px-3 py-2"
                            rows={3}
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Processing...' : 'Confirm Refund'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
