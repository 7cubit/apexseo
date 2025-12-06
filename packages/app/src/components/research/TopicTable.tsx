'use client';

import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TopicMap, TopicCluster } from '@/lib/TopicalMapService';
import { FileText, Plus } from 'lucide-react';

interface TopicTableProps {
    data: TopicMap | null;
    onGenerate: (cluster: TopicCluster) => void;
}

export function TopicTable({ data, onGenerate }: TopicTableProps) {
    if (!data) return <div className="p-8 text-center text-muted-foreground">No data available. Start a search.</div>;

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Topic Cluster</TableHead>
                        <TableHead>Primary Keyword</TableHead>
                        <TableHead>Volume</TableHead>
                        <TableHead>Difficulty</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.clusters.map((cluster) => (
                        <TableRow key={cluster.id}>
                            <TableCell className="font-medium">
                                <div className="flex flex-col">
                                    <span>{cluster.name}</span>
                                    <span className="text-xs text-muted-foreground">{cluster.contentType}</span>
                                </div>
                            </TableCell>
                            <TableCell>{cluster.primaryKeyword}</TableCell>
                            <TableCell>{cluster.searchVolume.toLocaleString()}</TableCell>
                            <TableCell>
                                <div className={`flex items-center gap-2 ${cluster.difficulty > 60 ? 'text-red-500' :
                                        cluster.difficulty > 30 ? 'text-yellow-500' : 'text-green-500'
                                    }`}>
                                    <span className="font-bold">{cluster.difficulty}</span>
                                    <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-current"
                                            style={{ width: `${cluster.difficulty}%` }}
                                        />
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant={
                                    cluster.status === 'Fully Covered' ? 'default' : // default is usually black/primary, maybe success needed
                                        cluster.status === 'Partially Covered' ? 'secondary' :
                                            'destructive'
                                }>
                                    {cluster.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button size="sm" variant="outline" onClick={() => onGenerate(cluster)}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
