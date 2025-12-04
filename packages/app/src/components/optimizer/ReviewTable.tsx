"use client";

import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Check, X, ExternalLink, Edit2 } from "lucide-react";
import { toast } from "sonner";

interface Suggestion {
    source_page_id: string;
    target_page_id: string;
    source_url: string;
    target_url: string;
    similarity_score: number;
    suggested_anchor: string;
    reason: string;
}

interface ReviewTableProps {
    suggestions: Suggestion[];
    onAccept: (id: string, anchor: string) => Promise<void>;
    onReject: (id: string, reason: string) => Promise<void>;
}

export function ReviewTable({ suggestions, onAccept, onReject }: ReviewTableProps) {
    // State to track edited anchors: { [suggestionIndex]: "new anchor text" }
    const [editedAnchors, setEditedAnchors] = useState<{ [key: number]: string }>({});

    const handleAccept = async (suggestion: Suggestion, index: number) => {
        try {
            // Construct ID as source:target for API
            const id = `${suggestion.source_page_id}:${suggestion.target_page_id}`;
            // Use edited anchor if available, otherwise default
            const anchorToUse = editedAnchors[index] || suggestion.suggested_anchor;

            await onAccept(id, anchorToUse);
            toast.success("Suggestion accepted");
        } catch (error) {
            toast.error("Failed to accept suggestion");
        }
    };

    const handleReject = async (suggestion: Suggestion) => {
        try {
            const id = `${suggestion.source_page_id}:${suggestion.target_page_id}`;
            await onReject(id, "User rejected");
            toast.success("Suggestion rejected");
        } catch (error) {
            toast.error("Failed to reject suggestion");
        }
    };

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Source</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Suggested Anchor</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {suggestions.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                No suggestions found. Run the optimizer to generate new opportunities.
                            </TableCell>
                        </TableRow>
                    ) : (
                        suggestions.map((suggestion, idx) => (
                            <TableRow key={idx}>
                                <TableCell className="font-medium max-w-[200px] truncate" title={suggestion.source_url}>
                                    {suggestion.source_url}
                                </TableCell>
                                <TableCell className="max-w-[200px] truncate" title={suggestion.target_url}>
                                    {suggestion.target_url}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={suggestion.similarity_score > 0.8 ? "default" : "secondary"}>
                                        {(suggestion.similarity_score * 100).toFixed(0)}%
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Input
                                        value={editedAnchors[idx] !== undefined ? editedAnchors[idx] : suggestion.suggested_anchor}
                                        onChange={(e) => setEditedAnchors(prev => ({ ...prev, [idx]: e.target.value }))}
                                        className="h-8 w-[250px]"
                                    />
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => handleReject(suggestion)}>
                                        <X className="h-4 w-4 text-red-500" />
                                    </Button>
                                    <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => handleAccept(suggestion, idx)}>
                                        <Check className="h-4 w-4 text-green-500" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
