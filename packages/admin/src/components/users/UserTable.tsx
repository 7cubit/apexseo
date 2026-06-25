'use client';

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    SortingState,
    getSortedRowModel,
} from '@tanstack/react-table';
import { User } from '../../hooks/useUsers';
import { useState } from 'react';
import { Button } from '@/components/ui/button'; // Placeholder, assume local or we create
// If shared UI not available, we can just use HTML elements with classes for now
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

// Simple UI components inline for now if not present, or we create them.
// Let's assume standard shadcn-like structure or just raw HTML table for speed.
// Using raw HTML table with Tailwind classes for robustness.

interface UserTableProps {
    data: User[];
    isLoading: boolean;
    pageCount: number;
    pagination: { pageIndex: number; pageSize: number };
    onPaginationChange: (pagination: any) => void;
    sorting: SortingState;
    onSortingChange: (updater: any) => void;
}

export function UserTable({
    data,
    isLoading,
    pageCount,
    pagination,
    onPaginationChange,
    sorting,
    onSortingChange,

}: UserTableProps) {

    const columns: ColumnDef<User>[] = [
        {
            accessorKey: 'email',
            header: ({ column }) => {
                return (
                    <button
                        className="flex items-center hover:text-gray-900"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    >
                        Email
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </button>
                )
            },
            cell: ({ row }) => <div className="lowercase">{row.getValue('email')}</div>,
        },
        {
            accessorKey: 'role',
            header: 'Role',
            cell: ({ row }) => <div className="capitalize">{row.getValue('role')?.toString().toLowerCase().replace('_', ' ')}</div>,
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold
             ${row.getValue('status') === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        row.getValue('status') === 'SUSPENDED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {row.getValue('status')}
                </span>
            )
        },
        {
            id: 'plan',
            header: 'Plan',
            cell: ({ row }) => {
                const plan = row.original.plan;
                return plan ? <span className="font-medium">{plan.name} ({plan.tier})</span> : <span className="text-gray-400">No Plan</span>
            }
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const user = row.original;
                return (
                    <div className="flex gap-2">
                        <Link href={`/users/${user.id}`} className="text-blue-600 hover:underline text-sm">
                            View
                        </Link>
                        {/* Add more actions like Suspend */}
                    </div>
                )
            }
        }
    ];

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        pageCount,
        state: {
            pagination,
            sorting
        },
        onPaginationChange,
        onSortingChange,
    });

    if (isLoading) {
        return <div>Loading users...</div>
    }

    return (
        <div className="w-full">
            <div className="rounded-md border">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th key={header.id} className="px-6 py-3">
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map(row => (
                                <tr key={row.id} className="bg-white border-b hover:bg-gray-50">
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="px-6 py-4">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <button
                    className="px-4 py-2 text-sm border rounded hover:bg-gray-100 disabled:opacity-50"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    Previous
                </button>
                <button
                    className="px-4 py-2 text-sm border rounded hover:bg-gray-100 disabled:opacity-50"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Next
                </button>
            </div>
        </div>
    );
}
