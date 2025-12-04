'use client';

import { useEffect, useState } from 'react';
import { Card, Button, Input } from '@apexseo/ui';
import { useAdminAuthStore } from '@/lib/stores/admin-auth-store';

interface Plan {
    id?: string;
    name: string;
    price: number;
    currency: string;
    features: string[];
}

export default function PlanBuilderPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [newPlan, setNewPlan] = useState<Plan>({ name: '', price: 0, currency: 'USD', features: [] });
    const [featureInput, setFeatureInput] = useState('');
    const { admin } = useAdminAuthStore();

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        const res = await fetch('/api/admin/plans');
        const data = await res.json();
        if (data.plans) setPlans(data.plans);
    };

    const handleAddFeature = () => {
        if (featureInput.trim()) {
            setNewPlan({ ...newPlan, features: [...newPlan.features, featureInput.trim()] });
            setFeatureInput('');
        }
    };

    const handleCreatePlan = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetch('/api/admin/plans', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...newPlan, admin_id: admin?.id })
        });
        setNewPlan({ name: '', price: 0, currency: 'USD', features: [] });
        fetchPlans();
        alert('Plan created successfully');
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Plan Builder</h1>
                <p className="text-gray-500">Create and manage subscription plans.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <Card className="p-6 sticky top-6">
                        <h3 className="text-lg font-semibold mb-4">Create New Plan</h3>
                        <form onSubmit={handleCreatePlan} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name</label>
                                <Input
                                    value={newPlan.name}
                                    onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                                    <Input
                                        type="number"
                                        value={newPlan.price}
                                        onChange={(e) => setNewPlan({ ...newPlan, price: parseFloat(e.target.value) })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                                    <select
                                        className="w-full border rounded-md p-2"
                                        value={newPlan.currency}
                                        onChange={(e) => setNewPlan({ ...newPlan, currency: e.target.value })}
                                    >
                                        <option value="USD">USD</option>
                                        <option value="EUR">EUR</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Features</label>
                                <div className="flex gap-2 mb-2">
                                    <Input
                                        value={featureInput}
                                        onChange={(e) => setFeatureInput(e.target.value)}
                                        placeholder="e.g. 5 Projects"
                                    />
                                    <Button type="button" variant="outline" onClick={handleAddFeature}>Add</Button>
                                </div>
                                <div className="space-y-1">
                                    {newPlan.features.map((f, i) => (
                                        <div key={i} className="text-sm bg-gray-50 px-2 py-1 rounded flex justify-between">
                                            <span>{f}</span>
                                            <button
                                                type="button"
                                                onClick={() => setNewPlan({ ...newPlan, features: newPlan.features.filter((_, idx) => idx !== i) })}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <Button type="submit" className="w-full">Create Plan</Button>
                        </form>
                    </Card>
                </div>

                <div className="lg:col-span-2">
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Existing Plans</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {plans.map((plan) => (
                                <div key={plan.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-lg">{plan.name}</h4>
                                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                            {plan.price} {plan.currency}
                                        </span>
                                    </div>
                                    <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                                        {plan.features.map((f, i) => (
                                            <li key={i}>{f}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
