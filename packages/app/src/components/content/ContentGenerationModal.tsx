'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { useContentGeneration } from '@/hooks/useContentGeneration';
import { ContentGenerationForm } from './generation/ContentGenerationForm';
import { ContentGenerationProgress } from './generation/ContentGenerationProgress';

interface ContentGenerationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate?: (content: any) => void;
    defaultKeyword?: string;
    projectId?: string;
}

export function ContentGenerationModal({ isOpen, onClose, onGenerate, defaultKeyword, projectId }: ContentGenerationModalProps) {
    const { form, step, progress, progressStep, generateContent, reset } = useContentGeneration({
        defaultKeyword,
        projectId,
        onSuccess: (result) => {
            if (onGenerate && result) {
                onGenerate(result);
            }
            onClose();
        }
    });

    // Reset form when modal closes/opens if needed, but for now we rely on internal state
    // Ideally we might want to reset on close.
    React.useEffect(() => {
        if (!isOpen) {
            // Optional: reset();
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 overflow-hidden bg-white dark:bg-gray-950">

                {step === 'form' ? (
                    <>
                        <DialogHeader className="px-6 py-4 border-b bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-sm">
                            <DialogTitle className="flex items-center gap-2 text-xl">
                                <Sparkles className="w-5 h-5 text-purple-600" />
                                AI Content Generator
                            </DialogTitle>
                        </DialogHeader>

                        <ContentGenerationForm
                            form={form}
                            onSubmit={generateContent}
                            projectId={projectId}
                        />

                        <DialogFooter className="px-6 py-4 border-t bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-sm flex justify-between items-center w-full">
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mr-auto">
                                <span>~3 minutes</span>
                                <span>•</span>
                                <span>Est. Cost: $0.42</span>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" onClick={onClose}>Cancel</Button>
                                <Button
                                    form="content-gen-form"
                                    type="submit"
                                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg shadow-purple-500/25"
                                >
                                    <Sparkles className="w-4 h-4 mr-2" /> Generate Content
                                </Button>
                            </div>
                        </DialogFooter>
                    </>
                ) : (
                    <ContentGenerationProgress
                        progress={progress}
                        progressStep={progressStep}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
