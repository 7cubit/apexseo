import { Card, CardContent, CardHeader, CardTitle } from '@apexseo/ui';
import { Button } from '@apexseo/ui';

interface Analysis {
    id: string;
    project: string;
    score: number;
    date: string;
    status: string;
}

interface RecentAnalysisProps {
    analyses: Analysis[];
}

export function RecentAnalysis({ analyses }: RecentAnalysisProps) {
    return (
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle>Recent Analysis</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-8">
                    {analyses.map((analysis) => (
                        <div key={analysis.id} className="flex items-center">
                            <div className="ml-4 space-y-1">
                                <p className="text-sm font-medium leading-none">{analysis.project}</p>
                                <p className="text-sm text-muted-foreground">
                                    {analysis.date}
                                </p>
                            </div>
                            <div className="ml-auto font-medium">
                                <div className={`flex items-center ${analysis.score >= 80 ? 'text-green-500' : analysis.score >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                                    <span className="text-xl font-bold">{analysis.score}</span>
                                    <span className="ml-1 text-xs">/ 100</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
