'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@apexseo/ui';
import { AlertTriangle } from 'lucide-react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex h-[50vh] w-full flex-col items-center justify-center gap-4">
                    <div className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-6 w-6" />
                        <h2 className="text-lg font-semibold">Something went wrong</h2>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {this.state.error?.message || 'An unexpected error occurred'}
                    </p>
                    <Button
                        variant="outline"
                        onClick={() => this.setState({ hasError: false, error: null })}
                    >
                        Try again
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}
