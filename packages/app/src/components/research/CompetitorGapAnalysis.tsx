import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, TrendingUp, AlertCircle, Trophy, ArrowRight, Download, Share2, Target, Swords, Ghost, History } from 'lucide-react';

interface KeywordCardProps {
    keyword: string;
    volume: number;
    difficulty: number;
    type: 'opportunity' | 'battle' | 'untapped' | 'lost';
    actionLabel: string;
    onAction: () => void;
}

const KeywordCard: React.FC<KeywordCardProps> = ({ keyword, volume, difficulty, type, actionLabel, onAction }) => {
    const getBadge = () => {
        switch (type) {
            case 'opportunity': return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Quick Win</Badge>;
            case 'battle': return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Improve Rank</Badge>;
            case 'untapped': return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Pioneer</Badge>;
            case 'lost': return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Rank Lost</Badge>;
        }
    };

    return (
        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-2">
                <div className="font-medium text-sm truncate pr-2" title={keyword}>{keyword}</div>
                {getBadge()}
            </div>
            <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                <span>Vol: {volume.toLocaleString()}</span>
                <span>KD: {difficulty}</span>
            </div>
            <Button
                size="sm"
                variant="outline"
                className="w-full text-xs h-7 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={onAction}
            >
                {actionLabel} <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
        </div>
    );
};

export function CompetitorGapAnalysis() {
    const [myDomain, setMyDomain] = useState('apexseo.com');
    const [competitors, setCompetitors] = useState<string[]>(['semrush.com', 'ahrefs.com']);
    const [loading, setLoading] = useState(false);

    // Mock Data
    const mockData = {
        lowHanging: [
            { keyword: 'seo content generator', volume: 1200, difficulty: 25 },
            { keyword: 'ai writing assistant', volume: 800, difficulty: 28 },
            { keyword: 'content brief template', volume: 500, difficulty: 15 },
        ],
        battles: [
            { keyword: 'keyword research tool', volume: 5400, difficulty: 65 },
            { keyword: 'backlink checker', volume: 3200, difficulty: 55 },
        ],
        untapped: [
            { keyword: 'semantic seo clustering for enterprise', volume: 150, difficulty: 10 },
            { keyword: 'programmatic seo workflows', volume: 200, difficulty: 20 },
        ],
        lost: [
            { keyword: 'free seo audit', volume: 2200, difficulty: 45 },
        ]
    };

    const handleAnalyze = () => {
        setLoading(true);
        setTimeout(() => setLoading(false), 1500);
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-black overflow-hidden">
            {/* Header */}
            <div className="bg-white dark:bg-gray-900 border-b p-4 flex flex-col md:flex-row gap-4 items-end md:items-center justify-between shadow-sm z-10">
                <div className="flex flex-col md:flex-row gap-4 w-full max-w-4xl">
                    <div className="space-y-1 flex-1">
                        <Label className="text-xs text-muted-foreground">Your Domain</Label>
                        <Input value={myDomain} onChange={e => setMyDomain(e.target.value)} className="h-9" />
                    </div>
                    <div className="space-y-1 flex-[2]">
                        <Label className="text-xs text-muted-foreground">Competitors (comma separated)</Label>
                        <Input
                            value={competitors.join(', ')}
                            onChange={e => setCompetitors(e.target.value.split(',').map(s => s.trim()))}
                            className="h-9"
                            placeholder="competitor1.com, competitor2.com"
                        />
                    </div>
                    <Button onClick={handleAnalyze} disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white h-9 mt-auto">
                        {loading ? 'Analyzing...' : 'Analyze Gaps'}
                    </Button>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-9"><Download className="w-4 h-4 mr-2" /> Export</Button>
                    <Button variant="outline" size="sm" className="h-9"><Share2 className="w-4 h-4 mr-2" /> Share</Button>
                </div>
            </div>

            {/* Main Grid */}
            <div className="flex-1 p-4 overflow-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full min-h-[600px]">

                    {/* Q1: Low Hanging Fruit */}
                    <Card className="flex flex-col h-full border-l-4 border-l-green-500 shadow-sm">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-green-100 rounded-lg text-green-600"><Target className="w-5 h-5" /></div>
                                    <div>
                                        <CardTitle className="text-base">Low-Hanging Fruit</CardTitle>
                                        <p className="text-xs text-muted-foreground">Competitors rank, you don't (KD &lt; 30)</p>
                                    </div>
                                </div>
                                <Badge variant="secondary">{mockData.lowHanging.length} Keywords</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 p-0">
                            <ScrollArea className="h-full p-4 pt-0">
                                <div className="space-y-3">
                                    {mockData.lowHanging.map((k, i) => (
                                        <KeywordCard
                                            key={i}
                                            {...k}
                                            type="opportunity"
                                            actionLabel="Steal Keyword"
                                            onAction={() => { }}
                                        />
                                    ))}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>

                    {/* Q2: Competitive Battles */}
                    <Card className="flex flex-col h-full border-l-4 border-l-yellow-500 shadow-sm">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600"><Swords className="w-5 h-5" /></div>
                                    <div>
                                        <CardTitle className="text-base">Competitive Battles</CardTitle>
                                        <p className="text-xs text-muted-foreground">You rank #4-20, they rank Top 3</p>
                                    </div>
                                </div>
                                <Badge variant="secondary">{mockData.battles.length} Keywords</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 p-0">
                            <ScrollArea className="h-full p-4 pt-0">
                                <div className="space-y-3">
                                    {mockData.battles.map((k, i) => (
                                        <KeywordCard
                                            key={i}
                                            {...k}
                                            type="battle"
                                            actionLabel="Optimize Content"
                                            onAction={() => { }}
                                        />
                                    ))}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>

                    {/* Q3: Untapped Opportunities */}
                    <Card className="flex flex-col h-full border-l-4 border-l-blue-500 shadow-sm">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><Ghost className="w-5 h-5" /></div>
                                    <div>
                                        <CardTitle className="text-base">Untapped Opportunities</CardTitle>
                                        <p className="text-xs text-muted-foreground">High volume, low KD, no one ranks well</p>
                                    </div>
                                </div>
                                <Badge variant="secondary">{mockData.untapped.length} Keywords</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 p-0">
                            <ScrollArea className="h-full p-4 pt-0">
                                <div className="space-y-3">
                                    {mockData.untapped.map((k, i) => (
                                        <KeywordCard
                                            key={i}
                                            {...k}
                                            type="untapped"
                                            actionLabel="Create Content"
                                            onAction={() => { }}
                                        />
                                    ))}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>

                    {/* Q4: Lost Battles */}
                    <Card className="flex flex-col h-full border-l-4 border-l-red-500 shadow-sm">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-red-100 rounded-lg text-red-600"><History className="w-5 h-5" /></div>
                                    <div>
                                        <CardTitle className="text-base">Lost Battles</CardTitle>
                                        <p className="text-xs text-muted-foreground">Keywords you lost rankings for recently</p>
                                    </div>
                                </div>
                                <Badge variant="secondary">{mockData.lost.length} Keywords</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 p-0">
                            <ScrollArea className="h-full p-4 pt-0">
                                <div className="space-y-3">
                                    {mockData.lost.map((k, i) => (
                                        <KeywordCard
                                            key={i}
                                            {...k}
                                            type="lost"
                                            actionLabel="Refresh Content"
                                            onAction={() => { }}
                                        />
                                    ))}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    );
}
