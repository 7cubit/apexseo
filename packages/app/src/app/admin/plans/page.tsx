'use client';

import { useEffect, useState } from 'react';
import { Card, Button, Input } from '@apexseo/ui';

interface Plan {
    id: string;
    name: string;
    price: number;
    currency: string;
    features: string[];
}

export default function AdminPlansPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    // New Plan Form State
    const [newPlan, setNewPlan] = useState({
        name: '',
        price: 0,
        currency: 'USD',
        features: ''
    });

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const res = await fetch('/api/admin/plans');
            const data = await res.json();
            if (data.plans) setPlans(data.plans);
        } catch (error) {
            console.error('Failed to fetch plans:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreatePlan = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/plans', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newPlan,
                    features: newPlan.features.split(',').map(f => f.trim())
                })
            });
            if (res.ok) {
                setIsCreating(false);
                setNewPlan({ name: '', price: 0, currency: 'USD', features: '' });
                fetchPlans();
            }
        } catch (error) {
            console.error('Failed to create plan:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Plan Management</h1>
                <Button onClick={() => setIsCreating(!isCreating)}>
                    {isCreating ? 'Cancel' : 'Create New Plan'}
                </Button>
            </div>

            {isCreating && (
                <Card className="p-6 bg-blue-50 border-blue-100">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">Create New Plan</h3>
                    <form onSubmit={handleCreatePlan} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-blue-900 mb-1">Name</label>
                                <Input
                                    value={newPlan.name}
                                    onChange={e => setNewPlan({ ...newPlan, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-blue-900 mb-1">Price</label>
                                <Input
                                    type="number"
                                    value={newPlan.price}
                                    onChange={e => setNewPlan({ ...newPlan, price: Number(e.target.value) })}
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-blue-900 mb-1">Features (comma separated)</label>
                            <Input
                                value={newPlan.features}
                                onChange={e => setNewPlan({ ...newPlan, features: e.target.value })}
                                placeholder="Feature 1, Feature 2, Feature 3"
                            />
                        </div>
                        <Button type="submit">Save Plan</Button>
                    </form>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map(plan => (
                    <Card key={plan.id} className="p-6 flex flex-col">
                        <div className="mb-4">
                            <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                            <p className="text-2xl font-bold text-blue-600 mt-2">
                                {plan.price} <span className="text-sm text-gray-500 font-normal">{plan.currency}</span>
                            </p>
                        </div>
                        <div className="flex-1">
                            <ul className="space-y-2">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className="text-sm text-gray-600 flex items-center">
                                        <span className="mr-2 text-green-500">✓</span> {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="mt-6 pt-4 border-t">
                            <Button variant="outline" className="w-full">Edit Plan</Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
