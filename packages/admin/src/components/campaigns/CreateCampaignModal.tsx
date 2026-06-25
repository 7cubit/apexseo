'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
    name: z.string().min(1, 'Name is required'),
    subject: z.string().min(1, 'Subject is required'),
    body: z.string().min(1, 'Body (HTML) is required'),
    segment: z.enum(['ALL', 'SUBSCRIBERS']).optional()
});

type FormData = z.infer<typeof schema>;

export function CreateCampaignModal({ onClose }: { onClose: () => void }) {
    const queryClient = useQueryClient();
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { segment: 'ALL' }
    });

    const mutation = useMutation({
        mutationFn: async (data: FormData) => {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/campaigns`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['campaigns'] });
            onClose();
        }
    });

    const onSubmit = (data: FormData) => {
        mutation.mutate(data);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                <h2 className="text-xl font-bold mb-4">Create New Campaign</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Campaign Name</label>
                        <input
                            {...register('name')}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                            placeholder="e.g. Weekly Newsletter"
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Subject Line</label>
                        <input
                            {...register('subject')}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                            placeholder="e.g. Check out our new features!"
                        />
                        {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email Body (HTML)</label>
                        <textarea
                            {...register('body')}
                            rows={10}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 font-mono text-sm"
                            placeholder="<h1>Hello {{firstName}}!</h1>"
                        />
                        <p className="text-xs text-gray-500 mt-1">Supported variables: {'{{firstName}}'}, {'{{email}}'}. Tracking footer appended automatically.</p>
                        {errors.body && <p className="text-red-500 text-xs mt-1">{errors.body.message}</p>}
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={mutation.isPending}
                            className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {mutation.isPending ? 'Creating...' : 'Create Campaign'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
