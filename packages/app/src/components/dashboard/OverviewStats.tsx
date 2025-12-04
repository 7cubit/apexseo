import { Card, CardContent, CardHeader, CardTitle } from '@apexseo/ui';
import { BarChart3, Globe, AlertTriangle, CheckCircle } from 'lucide-react';

interface StatsProps {
    totalProjects: number;
    avgHealthScore: number;
    criticalIssues: number;
    crawledPages: number;
}

export function OverviewStats({ totalProjects, avgHealthScore, criticalIssues, crawledPages }: StatsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                    <Globe className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalProjects}</div>
                    <p className="text-xs text-muted-foreground">+2 from last month</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Health Score</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{avgHealthScore}%</div>
                    <p className="text-xs text-muted-foreground">+5% from last week</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{criticalIssues}</div>
                    <p className="text-xs text-muted-foreground">-3 from last week</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Crawled Pages</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{crawledPages}</div>
                    <p className="text-xs text-muted-foreground">+120 since yesterday</p>
                </CardContent>
            </Card>
        </div>
    );
}
