import { RotateCw } from 'lucide-react';

export function Loading() {
    return (
        <div className="flex h-full w-full items-center justify-center p-8">
            <RotateCw className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
}
