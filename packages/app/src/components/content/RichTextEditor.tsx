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
                placeholder: 'Start writing your masterpiece...',
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
                class: 'prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[300px] leading-relaxed text-gray-800 dark:text-gray-200',
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
        <div className="flex flex-col h-full bg-white dark:bg-gray-950 relative">
            {/* Sticky Toolbar */}
            <div className="sticky top-0 z-10 flex items-center gap-1 p-2 border-b bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor.isActive('heading', { level: 1 }) ? 'bg-gray-100 dark:bg-gray-800' : ''}>H1</Button>
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'bg-gray-100 dark:bg-gray-800' : ''}>H2</Button>
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={editor.isActive('heading', { level: 3 }) ? 'bg-gray-100 dark:bg-gray-800' : ''}>H3</Button>
                <div className="w-px h-6 bg-gray-200 dark:bg-gray-800 mx-1" />
                <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'bg-gray-100 dark:bg-gray-800' : ''}><Bold className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'bg-gray-100 dark:bg-gray-800' : ''}><Italic className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'bg-gray-100 dark:bg-gray-800' : ''}><List className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={editor.isActive('blockquote') ? 'bg-gray-100 dark:bg-gray-800' : ''}><Quote className="w-4 h-4" /></Button>
                <div className="w-px h-6 bg-gray-200 dark:bg-gray-800 mx-1" />
                <Button variant="ghost" size="icon"><ImageIcon className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon"><LinkIcon className="w-4 h-4" /></Button>
                <div className="flex-1" />
                <Button variant="outline" size="sm" className="text-purple-600 border-purple-200 hover:bg-purple-50" onClick={() => handleAiAction('Expand')}>
                    <Wand2 className="w-4 h-4 mr-2" /> AI Assist
                </Button>
            </div>

            {/* Bubble Menu for Selection */}
            {/* {editor && (
                <BubbleMenu editor={editor}>
                    <div className="flex items-center gap-1 p-1 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-800">
                        <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => handleAiAction('Improve')}>
                            <Sparkles className="w-3 h-3 mr-1 text-purple-500" /> Improve
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => handleAiAction('Simplify')}>Simplify</Button>
                        <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => handleAiAction('Expand')}>Expand</Button>
                        <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => handleAiAction('Cite')}>Cite</Button>
                    </div>
                </BubbleMenu>
            )} */}

            {/* Editor Content */}
            <div className="flex-1 overflow-y-auto">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}
