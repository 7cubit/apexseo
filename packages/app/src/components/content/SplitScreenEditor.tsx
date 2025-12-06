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
        <div className="flex h-screen w-full overflow-hidden bg-[#F3F4F6] dark:bg-[#0B0E14]">
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
                        <div className="w-full h-full p-4 md:p-6 flex flex-col gap-4">

                            {/* Page Heading */}
                            <div className="flex items-center justify-between">
                                <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    Content editor
                                    <span className="text-blue-500 text-lg cursor-pointer hover:text-blue-600">✎</span>
                                </h1>

                                <Button
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm gap-2"
                                    onClick={() => setIsGenModalOpen(true)}
                                >
                                    <Sparkles className="w-4 h-4" /> AI Write
                                </Button>
                            </div>

                            {/* Title Input Section */}
                            <div className="bg-white dark:bg-[#151923] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-1">
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm pointer-events-none">
                                        Title
                                    </div>
                                    <input
                                        type="text"
                                        className="w-full pl-16 pr-4 py-3 bg-transparent text-lg font-semibold text-gray-900 dark:text-white placeholder:text-gray-300 focus:outline-none"
                                        value={title}
                                        onChange={(e) => useEditorStore.getState().setMetadata({ title: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Editor Card */}
                            <div className="bg-white dark:bg-[#151923] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 flex-1 min-h-[600px] flex flex-col">
                                {/* Toolbar Placeholder (RichTextEditor has its own, but we can style around it) */}
                                <div className="flex-1 p-6">
                                    <RichTextEditor />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Pane: SEO Panel */}
                    <div className="w-[400px] h-full bg-white dark:bg-[#151923] border-l border-gray-200 dark:border-gray-800 shadow-xl z-20 flex flex-col">
                        {/* Top Actions in Panel */}
                        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-[#1A1F2B]">
                            <div className="flex items-center gap-2">
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white w-20">
                                    SAVE
                                </Button>
                                <Button variant="outline" size="icon" className="h-9 w-9">
                                    <LayoutTemplate className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="icon" className="h-9 w-9">
                                    <Send className="w-4 h-4" />
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
