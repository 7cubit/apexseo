'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { CompetingPage } from '../../lib/services/CannibalizationService';
import { GitMerge, Search, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface ConflictResolutionModalProps {
    isOpen: boolean;
    onClose: () => void;
    keyword: string;
    pages: CompetingPage[];
}

export function ConflictResolutionModal({ isOpen, onClose, keyword, pages }: ConflictResolutionModalProps) {
    const [strategy, setStrategy] = useState<'merge' | 'focus' | 'noindex'>('merge');
    const [primaryPage, setPrimaryPage] = useState<string>(pages[0]?.id || '');

    const handleExecute = () => {
        toast.success("Resolution Strategy Applied", {
            description: `Successfully executed ${strategy} strategy for "${keyword}"`
        });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Resolve Cannibalization: "{keyword}"</DialogTitle>
                    <DialogDescription>
                        {pages.length} pages are competing for this keyword. Choose a strategy to fix it.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-6">
                    {/* Strategy Selection */}
                    <RadioGroup defaultValue="merge" onValueChange={(v) => setStrategy(v as any)} className="grid grid-cols-3 gap-4">
                        <div>
                            <RadioGroupItem value="merge" id="merge" className="peer sr-only" />
                            <Label
                                htmlFor="merge"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-purple-600 [&:has([data-state=checked])]:border-purple-600 cursor-pointer h-full"
                            >
                                <GitMerge className="mb-3 h-6 w-6" />
                                <div className="text-center">
                                    <div className="font-semibold">Merge Pages</div>
                                    <span className="text-xs text-muted-foreground">Combine content into one strong page</span>
                                </div>
                            </Label>
                        </div>
                        <div>
                            <RadioGroupItem value="focus" id="focus" className="peer sr-only" />
                            <Label
                                htmlFor="focus"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-purple-600 [&:has([data-state=checked])]:border-purple-600 cursor-pointer h-full"
                            >
                                <Search className="mb-3 h-6 w-6" />
                                <div className="text-center">
                                    <div className="font-semibold">Change Focus</div>
                                    <span className="text-xs text-muted-foreground">Target different keywords for secondary pages</span>
                                </div>
                            </Label>
                        </div>
                        <div>
                            <RadioGroupItem value="noindex" id="noindex" className="peer sr-only" />
                            <Label
                                htmlFor="noindex"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-purple-600 [&:has([data-state=checked])]:border-purple-600 cursor-pointer h-full"
                            >
                                <EyeOff className="mb-3 h-6 w-6" />
                                <div className="text-center">
                                    <div className="font-semibold">Noindex</div>
                                    <span className="text-xs text-muted-foreground">Keep pages but remove from search results</span>
                                </div>
                            </Label>
                        </div>
                    </RadioGroup>

                    {/* Strategy Details */}
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border">
                        {strategy === 'merge' && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Select Primary Page (The Survivor)</Label>
                                    <Select value={primaryPage} onValueChange={setPrimaryPage}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {pages.map(p => (
                                                <SelectItem key={p.id} value={p.id}>
                                                    {p.title} (Rank #{p.currentRank})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="text-sm text-gray-500">
                                    <p>The other {pages.length - 1} pages will be 301 redirected to the primary page.</p>
                                    <p>Content will be analyzed and merged by AI.</p>
                                </div>
                            </div>
                        )}

                        {strategy === 'focus' && (
                            <div className="space-y-4">
                                <p className="text-sm text-gray-500">We found alternative keywords for your conflicting pages:</p>
                                {pages.slice(1).map((p, i) => (
                                    <div key={p.id} className="flex items-center justify-between bg-white dark:bg-black p-2 rounded border">
                                        <span className="text-sm truncate max-w-[150px]">{p.title}</span>
                                        <ArrowRight className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm font-semibold text-green-600">
                                            {i === 0 ? 'wordpress hardening' : 'secure login'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {strategy === 'noindex' && (
                            <div className="space-y-4">
                                <Label>Select pages to Noindex</Label>
                                {pages.map(p => (
                                    <div key={p.id} className="flex items-center space-x-2">
                                        <Checkbox id={`noindex-${p.id}`} defaultChecked={p.id !== primaryPage} disabled={p.id === primaryPage} />
                                        <label htmlFor={`noindex-${p.id}`} className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                            {p.title}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleExecute} className="bg-purple-600 hover:bg-purple-700">
                        Execute Strategy
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
