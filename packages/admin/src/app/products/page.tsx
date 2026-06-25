'use client';

import { useProducts, useUpdateProduct } from '../../hooks/useProducts';
import { useState } from 'react';
import { Package, Plus, DollarSign, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from '../../components/layout/DashboardLayout';

export const dynamic = 'force-dynamic';

export default function ProductsPage() {
    const { data: products, isLoading } = useProducts();
    const updateProduct = useUpdateProduct();

    if (isLoading) return <div>Loading products...</div>;

    const handleToggleActive = (id: string, currentStatus: boolean) => {
        updateProduct.mutate({ id, data: { isActive: !currentStatus } });
    };

    return (
        <DashboardLayout>
            <div className="container mx-auto py-10">
                <h1 className="text-2xl font-bold mb-5">Product Management</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products?.map((product: any) => (
                        <div key={product.id} className="border p-4 rounded shadow bg-white">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-lg font-bold">{product.name}</h2>
                                    <p className="text-sm text-gray-500">{product.tier} - {product.interval}</p>
                                </div>
                                <div className={`px-2 py-1 text-xs rounded-full ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {product.isActive ? 'Active' : 'Inactive'}
                                </div>
                            </div>
                            <div className="mt-2 font-mono text-xl">${product.price}</div>

                            <div className="mt-4">
                                <h3 className="font-semibold text-sm mb-2">Feature Flags</h3>
                                <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                                    {JSON.stringify(product.featureFlags, null, 2)}
                                </pre>
                            </div>

                            <div className="mt-4 flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleToggleActive(product.id, product.isActive)}
                                >
                                    {product.isActive ? 'Deactivate' : 'Activate'}
                                </Button>
                                <Button variant="default" size="sm">Edit</Button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-8">
                    <Button>Create New Product</Button>
                </div>
            </div>
        </DashboardLayout>
    );
}
