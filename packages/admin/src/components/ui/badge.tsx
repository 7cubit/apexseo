import React from 'react';
import { twMerge } from 'tailwind-merge';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'secondary' | 'destructive' | 'outline';
}

export const Badge: React.FC<BadgeProps> = ({ children, className, variant = 'default', ...props }) => {
    const variants = {
        default: 'bg-gray-800 text-gray-300',
        success: 'bg-green-900/30 text-green-400 border border-green-900',
        warning: 'bg-yellow-900/30 text-yellow-400 border border-yellow-900',
        danger: 'bg-red-900/30 text-red-400 border border-red-900',
        info: 'bg-blue-900/30 text-blue-400 border border-blue-900',
        secondary: 'bg-gray-700 text-gray-200',
        destructive: 'bg-red-900/30 text-red-400 border border-red-900',
        outline: 'text-foreground border border-input hover:bg-accent hover:text-accent-foreground',
    };

    return (
        <span
            className={twMerge(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
};
