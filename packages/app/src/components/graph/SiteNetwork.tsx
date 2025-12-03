"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { GraphView } from './GraphView';
import { RecommendationSidebar } from './RecommendationSidebar';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface LinkSuggestion {
    site_id: string;
    from_page_id: string;
    to_page_id: string;
    similarity: number;
    target_tspr: number;
    score: number;
    reason?: string;
}

interface SiteNetworkProps {
    projectId?: string;
}

export function SiteNetwork({ projectId: propProjectId }: SiteNetworkProps) {
    const searchParams = useSearchParams();
    const projectUrl = searchParams.get("project");
    const projectId = propProjectId || (projectUrl ? projectUrl.replace(/[^a-z0-9]/g, "-") : "example-com");

    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [suggestions, setSuggestions] = useState<LinkSuggestion[]>([]);
    const [isLoadingGraph, setIsLoadingGraph] = useState(true);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);
    const [highlightedNodes, setHighlightedNodes] = useState<string[]>([]);
    const [highlightedEdges, setHighlightedEdges] = useState<string[]>([]);

    const fetchGraph = useCallback(async () => {
        setIsLoadingGraph(true);
        try {
            // Mocking the graph data fetch for now as I don't have the API running
            // In a real scenario: const res = await fetch(`/api/projects/${projectId}/graph`);
            // For now, I'll simulate a fetch
            const res = await fetch(`/api/projects/${projectId}/graph`);
            if (res.ok) {
                const data = await res.json();
                setNodes(data.nodes || []);
                setEdges(data.edges || []);
            }
        } catch (error) {
            console.error("Failed to fetch graph:", error);
        } finally {
            setIsLoadingGraph(false);
        }
    }, [projectId]);

    const fetchSuggestions = useCallback(async () => {
        setIsLoadingSuggestions(true);
        try {
            const res = await fetch(`/api/projects/${projectId}/links`);
            if (res.ok) {
                const json = await res.json();
                setSuggestions(json.suggestions || []);
            }
        } catch (error) {
            console.error("Failed to fetch suggestions:", error);
        } finally {
            setIsLoadingSuggestions(false);
        }
    }, [projectId]);

    useEffect(() => {
        if (projectId) {
            fetchGraph();
            fetchSuggestions();
        }
    }, [projectId, fetchGraph, fetchSuggestions]);

    const handleHoverSuggestion = (fromId: string | null, toId: string | null) => {
        if (fromId && toId) {
            setHighlightedNodes([fromId, toId]);
            // Find edge if it exists (optional, or create a temporary edge visualization)
            // For now, just highlighting nodes
        } else {
            setHighlightedNodes([]);
        }
    };

    return (
        <div className="flex h-[700px] border border-gray-800 rounded-xl overflow-hidden bg-[#0B0E14]">
            <div className="flex-1 relative">
                {isLoadingGraph ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    </div>
                ) : (
                    <GraphView
                        initialNodes={nodes}
                        initialEdges={edges}
                        highlightedNodes={highlightedNodes}
                    />
                )}
            </div>
            <RecommendationSidebar
                suggestions={suggestions}
                onHoverSuggestion={handleHoverSuggestion}
                isLoading={isLoadingSuggestions}
            />
        </div>
    );
}
