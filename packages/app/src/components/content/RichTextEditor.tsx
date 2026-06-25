'use client';

import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEditorStore } from '@/stores/editorStore';
import { Bold, Italic, List, Quote, Code, Image as ImageIcon, Link as LinkIcon, Wand2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function RichTextEditor() {
    const { setContent, setSaving } = useEditorStore();

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: 'Start with a title (Heading 1), then write your content...',
            }),
        ],
        immediatelyRender: false,
        content: '',
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            const text = editor.getText();
            const wordCount = text.trim().split(/\s+/).length;

            setContent(html, wordCount);

            // Simulate Auto-save trigger
            setSaving(true);
            setTimeout(() => setSaving(false), 800); // Debounce save in real app
        },
        editorProps: {
            attributes: {
                class: 'prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[500px] leading-relaxed text-foreground',
            },
        },
    });

    if (!editor) {
        return null;
    }

    const handleAiAction = (action: string) => {
        toast.info(`AI Action: ${action}`, { description: "Processing your request..." });
        // In real app, call API to rephrase/expand selection
    };

    return (
        <div className="flex flex-col h-full bg-transparent relative">
            {/* Floating Toolbar - Will appear on text selection (to be implemented) */}
            {/* For now, toolbar is hidden to create clean writing space */}

            {/* Editor Content - Clean, Notion-style */}
            <div className="flex-1 overflow-y-auto">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}
