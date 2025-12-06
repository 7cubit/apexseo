import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contentGenerationSchema, ContentGenerationFormData } from '@/lib/schemas/content-generation';
import { toast } from 'sonner';

export interface UseContentGenerationProps {
    defaultKeyword?: string;
    projectId?: string;
    onSuccess?: (result?: any) => void;
}

export function useContentGeneration({ defaultKeyword, projectId, onSuccess }: UseContentGenerationProps) {
    const [step, setStep] = useState<'form' | 'generating'>('form');
    const [progress, setProgress] = useState(0);
    const [progressStep, setProgressStep] = useState('');
    const [workflowId, setWorkflowId] = useState<string | null>(null);
    const pollInterval = useRef<NodeJS.Timeout | null>(null);

    const form = useForm<ContentGenerationFormData>({
        resolver: zodResolver(contentGenerationSchema),
        defaultValues: {
            targetKeyword: defaultKeyword || '',
            secondaryKeywords: [],
            contentType: 'How-To Guide',
            projectId: projectId || '',
            researchProvider: 'perplexity',
            draftingProvider: 'openai',
            audienceLevel: 'Intermediate',
            perspective: 'Second Person',
            wordCountTarget: 1500,
            toneAdjustment: 0,
            includeSections: ['Key Takeaways', 'FAQ'],
            internalLinks: []
        }
    });

    // Cleanup polling on unmount
    useEffect(() => {
        return () => {
            if (pollInterval.current) clearInterval(pollInterval.current);
        };
    }, []);

    const pollStatus = async (wId: string) => {
        try {
            const res = await fetch(`/api/generation?workflowId=${wId}`);
            const data = await res.json();

            if (data.status === 'RUNNING') {
                // In a real app, query the workflow for detailed progress
                // For now, we simulate progress based on time or just show "Processing"
                setProgress((prev) => Math.min(prev + 5, 90));
                setProgressStep('Generating content...');
            } else if (data.status === 'COMPLETED') {
                setProgress(100);
                setProgressStep('Completed!');
                toast.success("Content Generated Successfully!");
                if (pollInterval.current) clearInterval(pollInterval.current);
                if (onSuccess) onSuccess(data.result);
            } else if (data.status === 'FAILED' || data.status === 'TERMINATED') {
                if (pollInterval.current) clearInterval(pollInterval.current);
                toast.error(`Generation Failed: ${data.status}`);
                setStep('form');
            }
        } catch (error) {
            console.error("Polling error", error);
        }
    };

    const generateContent = async (data: ContentGenerationFormData) => {
        setStep('generating');
        setProgress(0);
        setProgressStep('Starting workflow...');

        try {
            const response = await fetch('/api/generation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'start',
                    topic: data.targetKeyword,
                    targetKeyword: data.targetKeyword,
                    projectId: data.projectId,
                    userId: 'user-123', // Mock user ID
                    config: {
                        tone: data.toneAdjustment.toString(),
                        wordCount: data.wordCountTarget,
                        provider: data.draftingProvider
                    }
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to start workflow');
            }

            const { workflowId } = await response.json();
            setWorkflowId(workflowId);

            // Start Polling
            pollInterval.current = setInterval(() => pollStatus(workflowId), 2000);

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to generate content");
            setStep('form');
        }
    };

    return {
        form,
        step,
        progress,
        progressStep,
        generateContent: form.handleSubmit(generateContent),
        reset: () => {
            setStep('form');
            setProgress(0);
            form.reset();
            if (pollInterval.current) clearInterval(pollInterval.current);
        }
    };
}
