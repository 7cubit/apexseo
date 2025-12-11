import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, BrainCircuit } from 'lucide-react';

interface SemanticSetupProps {
    onAnalyze: (seedKeyword: string, rawKeywords: string[]) => Promise<void>;
    loading: boolean;
}

export function SemanticSetupWizard({ onAnalyze, loading }: SemanticSetupProps) {
    const [open, setOpen] = useState(false);
    const [seedKeyword, setSeedKeyword] = useState('');
    const [rawKeywordsInput, setRawKeywordsInput] = useState('');

    const handleSubmit = async () => {
        const keywords = rawKeywordsInput.split('\n').map(k => k.trim()).filter(k => k.length > 0);
        await onAnalyze(seedKeyword, keywords);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 border-purple-500/50 hover:bg-purple-500/10 hover:border-purple-500 text-purple-600 dark:text-purple-400">
                    <BrainCircuit className="w-4 h-4" />
                    Semantic Architect
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Semantic Cluster Architect</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="seed">Seed Keyword</Label>
                        <Input
                            id="seed"
                            value={seedKeyword}
                            onChange={(e) => setSeedKeyword(e.target.value)}
                            placeholder="e.g. 'project management software'"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="keywords">Raw Keywords (One per line)</Label>
                        <Textarea
                            id="keywords"
                            value={rawKeywordsInput}
                            onChange={(e) => setRawKeywordsInput(e.target.value)}
                            placeholder="Paste your list of keywords here..."
                            className="h-40 font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                            Usually exported from Ahrefs, Semrush, or GSC.
                        </p>
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={loading || !seedKeyword || !rawKeywordsInput}>
                        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Run Analysis
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
