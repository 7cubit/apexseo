'use client';

import React, { useState } from 'react';
import { ContentInputForm } from '@/components/content/ContentInputForm';
import { ContentResults } from '@/components/content/ContentResults';
import { EEATRequest, EEATResponse } from '@/lib/eeat-service';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';

export default function ContentStudioPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<EEATResponse | null>(null);

    const handleGenerate = async (request: EEATRequest) => {
        setIsLoading(true);
        setResult(null);
        try {
            const res = await fetch('/api/workflows/eeat-power', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(request)
            });

            if (!res.ok) {
                throw new Error('Failed to generate content');
            }

            const data = await res.json();
            setResult(data);
        } catch (error) {
            console.error(error);
            // Ideally show toast error here
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50 dark:bg-[#0B0D12] overflow-hidden">
            <DashboardHeader />

            <main className="flex-1 overflow-hidden p-6">
                <div className="max-w-[1600px] mx-auto h-full flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Content Studio</h1>
                    </div>

                    <div className="flex-1 min-h-0">
                        {!result ? (
                            <div className="max-w-2xl mx-auto mt-10">
                                <ContentInputForm onSubmit={handleGenerate} isLoading={isLoading} />
                            </div>
                        ) : (
                            <div className="h-full flex flex-col gap-4">
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => setResult(null)}
                                        className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white underline"
                                    >
                                        Start New Draft
                                    </button>
                                </div>
                                <div className="flex-1 min-h-0">
                                    <ContentResults result={result} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
