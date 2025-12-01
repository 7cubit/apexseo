"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce'; // Need to create this or use library
import { cn } from '@/lib/utils';

interface EditorProps {
    initialContent?: string;
    onChange?: (content: string) => void;
    onSave?: (content: string) => void;
}

export function Editor({ initialContent = '', onChange, onSave }: EditorProps) {
    const [content, setContent] = useState(initialContent);
    const debouncedContent = useDebounce(content, 1000);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: 'Start writing...',
            }),
        ],
        content: initialContent,
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[500px] p-4',
            },
        },
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            setContent(html);
            onChange?.(html);
        },
    });

    useEffect(() => {
        if (debouncedContent && onSave) {
            onSave(debouncedContent);
        }
    }, [debouncedContent, onSave]);

    if (!editor) {
        return null;
    }

    return (
        <div className="border rounded-md bg-background">
            <div className="border-b p-2 flex gap-2 bg-muted/50">
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={cn("p-1 rounded hover:bg-muted", editor.isActive('bold') && "bg-muted-foreground/20")}
                >
                    Bold
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={cn("p-1 rounded hover:bg-muted", editor.isActive('italic') && "bg-muted-foreground/20")}
                >
                    Italic
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={cn("p-1 rounded hover:bg-muted", editor.isActive('heading', { level: 2 }) && "bg-muted-foreground/20")}
                >
                    H2
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={cn("p-1 rounded hover:bg-muted", editor.isActive('bulletList') && "bg-muted-foreground/20")}
                >
                    List
                </button>
            </div>
            <EditorContent editor={editor} />
        </div>
    );
}
