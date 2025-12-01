"use client";

import { DndContext, DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const STATUSES = ['Idea', 'Draft', 'Review', 'Published'];

interface Task {
    id: string;
    title: string;
    status: string;
}

function DraggableTask({ task }: { task: Task }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: task.id,
    });
    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="p-3 bg-card border rounded shadow-sm cursor-move mb-2">
            {task.title}
        </div>
    );
}

function DroppableColumn({ status, tasks }: { status: string, tasks: Task[] }) {
    const { setNodeRef } = useDroppable({
        id: status,
    });

    return (
        <div ref={setNodeRef} className="bg-muted/50 p-4 rounded-lg min-h-[500px]">
            <h3 className="font-semibold mb-4">{status}</h3>
            {tasks.map(task => (
                <DraggableTask key={task.id} task={task} />
            ))}
        </div>
    );
}

export function PipelineBoard() {
    const [tasks, setTasks] = useState<Task[]>([
        { id: '1', title: 'Top 10 Tokyo Hotels', status: 'Idea' },
        { id: '2', title: 'Kyoto Guide 2024', status: 'Draft' },
        { id: '3', title: 'Best Ramen Spots', status: 'Review' },
    ]);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setTasks((items) => {
                return items.map(item => {
                    if (item.id === active.id) {
                        return { ...item, status: over.id as string };
                    }
                    return item;
                });
            });
        }
    };

    return (
        <DndContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {STATUSES.map(status => (
                    <DroppableColumn key={status} status={status} tasks={tasks.filter(t => t.status === status)} />
                ))}
            </div>
        </DndContext>
    );
}
