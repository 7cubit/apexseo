import React from 'react';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, noPadding = false, ...props }) => {
    return (
        <div
            className={twMerge(
                'bg-gray-900 border border-gray-800 rounded-xl shadow-sm overflow-hidden',
                className
            )}
            {...props}
        >
            <div className={noPadding ? '' : 'p-6'}>
                {children}
            </div>
        </div>
    );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
    <div className={twMerge('px-6 py-4 border-b border-gray-800', className)} {...props}>
        {children}
    </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ children, className, ...props }) => (
    <h3 className={twMerge('text-lg font-semibold text-white', className)} {...props}>
        {children}
    </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ children, className, ...props }) => (
    <p className={twMerge('text-sm text-gray-400 mt-1', className)} {...props}>
        {children}
    </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
    <div className={twMerge('p-6', className)} {...props}>
        {children}
    </div>
);
