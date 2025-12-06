'use client';

import React, { useState } from 'react';
import { RichTextEditor } from './RichTextEditor';
import { SeoScorePanel } from './SeoScorePanel';
import { ContentGenerationModal } from './ContentGenerationModal';
import { SeoMetadataModal } from './SeoMetadataModal';
import { Button } from '@/components/ui/button';
import { Save, Send, MoreHorizontal, Settings, Sparkles, ArrowLeft, LayoutTemplate, Type } from 'lucide-react';
import { useEditorStore } from '@/stores/editorStore';
import { toast } from 'sonner';
import Link from 'next/link';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { EditorHeader } from '@/components/layout/EditorHeader';

export function SplitScreenEditor() {
    const [isGenModalOpen, setIsGenModalOpen] = useState(false);
    const [isMetaModalOpen, setIsMetaModalOpen] = React.useState(false);
    const {
        content,
        setContent,
        title,
        metaDescription,
        primaryKeyword,
        isSaving,
        lastSaved
    } = useEditorStore();

    const handlePublish = () => {
        toast.success("Content Published!", { description: "Your article is now live." });
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-editor-bg">
            {/* Sidebar */}
            <AppSidebar />

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
                {/* Header */}
                <EditorHeader />

                {/* Split View */}
                <div className="flex-1 flex overflow-hidden relative">
                    {/* Left Pane: Editor Area */}
                    <div className="flex-1 h-full flex flex-col relative overflow-y-auto custom-scrollbar">
                        <div className="w-full h-full p-6 md:p-8 lg:p-12 flex flex-col">

                            {/* Minimal Page Indicator - Subtle and unobtrusive */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Content Editor</span>
                                </div>
                            </div>

                            {/* Unified Editor Card - Title is now H1 in the editor */}
                            <div className="bg-editor-surface rounded-xl shadow-depth-md border border-border/30 flex-1 min-h-[600px] flex flex-col overflow-hidden">
                                <div className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar">
                                    <RichTextEditor />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Pane: SEO Panel */}
                    <div className="w-[400px] h-full bg-editor-surface border-l border-border/30 shadow-depth-lg z-20 flex flex-col">
                        {/* Top Actions in Panel */}
                        <div className="p-4 border-b border-border/30 flex items-center justify-between bg-secondary/20">
                            <div className="flex items-center gap-2">
                                <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                                    SAVE
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2 border-border/50"
                                    onClick={() => setIsGenModalOpen(true)}
                                >
                                    <Sparkles className="w-4 h-4" /> AI
                                </Button>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* SEO Score Panel Content */}
                        <div className="flex-1 overflow-hidden">
                            <SeoScorePanel />
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <ContentGenerationModal
                isOpen={isGenModalOpen}
                onClose={() => setIsGenModalOpen(false)}
                onGenerate={(result) => {
                    if (result?.content) {
                        setContent(result.content, result.metadata?.wordCount || 0);
                        if (result.metadata?.title) {
                            useEditorStore.getState().setMetadata({ title: result.metadata.title });
                        }
                    }
                }}
            />
            <SeoMetadataModal
                isOpen={isMetaModalOpen}
                onClose={() => setIsMetaModalOpen(false)}
            />
        </div>
    );
}
