import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";

interface LinkSuggestion {
    site_id: string;
    from_page_id: string;
    to_page_id: string;
    similarity: number;
    target_tspr: number;
    score: number;
    reason?: string;
}

interface RecommendationSidebarProps {
    suggestions: LinkSuggestion[];
    onHoverSuggestion: (fromId: string | null, toId: string | null) => void;
    isLoading?: boolean;
}

export function RecommendationSidebar({ suggestions, onHoverSuggestion, isLoading }: RecommendationSidebarProps) {
    return (
        <div className="w-80 border-l border-gray-800/50 bg-[#0B0E14] flex flex-col h-full">
            <div className="p-4 border-b border-gray-800/50">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    Link Recommendations
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                    Hover to visualize connections
                </p>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-3">
                    {isLoading ? (
                        <div className="text-center text-gray-500 py-8">Loading suggestions...</div>
                    ) : suggestions.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">No recommendations found.</div>
                    ) : (
                        suggestions.map((suggestion, index) => (
                            <Card
                                key={index}
                                className="bg-[#151923] border-gray-800 hover:border-blue-500/50 transition-colors cursor-pointer group"
                                onMouseEnter={() => onHoverSuggestion(suggestion.from_page_id, suggestion.to_page_id)}
                                onMouseLeave={() => onHoverSuggestion(null, null)}
                            >
                                <CardContent className="p-3 space-y-2">
                                    <div className="flex justify-between items-start">
                                        <div className="bg-blue-500/10 text-blue-400 text-xs px-2 py-0.5 rounded-full">
                                            Score: {suggestion.score.toFixed(2)}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {(suggestion.similarity * 100).toFixed(0)}% Match
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="text-xs text-gray-400 font-medium truncate" title={suggestion.from_page_id}>
                                            From: {suggestion.from_page_id}
                                        </div>
                                        <div className="flex justify-center text-gray-600">
                                            <ArrowRight className="w-3 h-3" />
                                        </div>
                                        <div className="text-xs text-blue-400 font-medium truncate" title={suggestion.to_page_id}>
                                            To: {suggestion.to_page_id}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
