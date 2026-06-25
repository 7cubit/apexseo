'use client';

import { useUsers } from '../../hooks/useUsers';
import { UserTable } from '../../components/users/UserTable';
import { useState } from 'react';
import { SortingState } from '@tanstack/react-table';

import { DashboardLayout } from '../../components/layout/DashboardLayout';

export const dynamic = 'force-dynamic';

export default function UsersPage() {
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const [sorting, setSorting] = useState<SortingState>([]);

    // Construct params
    // Note: API expects page=1 indexed, Table uses pageIndex=0 indexed
    const { data, isLoading } = useUsers({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        // Sort handling not yet in API params schema clearly? 
        // We added filtering but not explicit sort field in API. (It hardcoded orderBy createdAt desc).
        // For MVP, we pass data but backend sort is fixed for now or we update API.
        // Let's implement basics.
    });

    return (
        <DashboardLayout>
            <div className="container mx-auto py-10">
                <h1 className="text-2xl font-bold mb-5">Users</h1>
                <UserTable
                    data={data?.data || []}
                    isLoading={isLoading}
                    pageCount={data?.meta?.pages || 0}
                    pagination={pagination}
                    onPaginationChange={setPagination}
                    sorting={sorting}
                    onSortingChange={setSorting}
                />
            </div>
        </DashboardLayout>
    );
}
