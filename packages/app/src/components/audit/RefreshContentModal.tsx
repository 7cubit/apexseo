'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ContentAuditService, RefreshRecommendation, AuditPage } from '@/lib/services/ContentAuditService';
import { Loader2, Sparkles, ArrowRight, AlertTriangle, FileText, Link as LinkIcon, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface RefreshContentModalProps {
    isOpen: boolean;
    onClose: () => void;
    page: AuditPage | null;
}

export function RefreshContentModal({ isOpen, onClose, page }: RefreshContentModalProps) {
    const [loading, setLoading] = useState(true);
    const [recommendations, setRecommendations] = useState<RefreshRecommendation[]>([]);
    const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

    const service = new ContentAuditService();

    useEffect(() => {
        if (isOpen && page) {
            setLoading(true);
            setRecommendations([]);
            setSelectedIndices([]);

            service.analyzeContentRefresh(page.id).then(recs => {
                setRecommendations(recs);
                setSelectedIndices(recs.map((_, i) => i)); // Select all by default
                setLoading(false);
            });
        }
    }, [isOpen, page]);

    const toggleSelection = (index: number) => {
        if (selectedIndices.includes(index)) {
            setSelectedIndices(selectedIndices.filter(i => i !== index));
        } else {
            setSelectedIndices([...selectedIndices, index]);
        }
    };

    const handleApply = () => {
        toast.success("Opening Editor...", {
            description: `Applying ${selectedIndices.length} AI recommendations to "${page?.title}"`
        });
        // In real app: Navigate to editor with instructions
        onClose();
    };

    if (!page) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[700px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                        AI Content Refresh: {page.title}
                    </DialogTitle>
                    <DialogDescription>
                        Analyzing content against current SERP competitors and freshness signals.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                            <p className="text-sm text-gray-500">Scanning top 10 competitors...</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-100 dark:border-purple-800">
                                <div>
                                    <h4 className="font-semibold text-purple-900 dark:text-purple-200">Refresh Score</h4>
                                    <p className="text-xs text-purple-700 dark:text-purple-300">Potential Impact: High</p>
                                </div>
                                <div className="text-2xl font-bold text-purple-600">+15%</div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-sm font-medium text-gray-500 uppercase">Recommended Updates</h4>
                                {recommendations.map((rec, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                                        <Checkbox
                                            id={`rec-${i}`}
                                            checked={selectedIndices.includes(i)}
                                            onCheckedChange={() => toggleSelection(i)}
                                            className="mt-1"
                                        />
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <label htmlFor={`rec-${i}`} className="font-medium text-sm cursor-pointer">
                                                    {rec.action}
                                                </label>
                                                <Badge variant="outline" className="text-[10px] h-5">
                                                    {rec.type.replace('_', ' ')}
                                                </Badge>
                                                {rec.impact === 'high' && (
                                                    <Badge variant="destructive" className="text-[10px] h-5">High Impact</Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500">{rec.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleApply} disabled={loading || selectedIndices.length === 0} className="bg-purple-600 hover:bg-purple-700">
                        Apply & Open Editor
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
