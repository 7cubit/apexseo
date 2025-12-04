import { Card } from "@apexseo/ui";

interface IssueCount {
    severity: "critical" | "high" | "medium" | "low";
    count: number;
    label: string;
}

interface IssuesSummaryCardProps {
    issues: IssueCount[];
}

export function IssuesSummaryCard({ issues }: IssuesSummaryCardProps) {
    const totalIssues = issues.reduce((acc, curr) => acc + curr.count, 0);

    return (
        <Card className="p-6 space-y-4">
            <h3 className="text-lg font-medium text-muted-foreground">Issues Found</h3>

            <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-bold">{totalIssues}</span>
                <span className="text-sm text-muted-foreground">Total Issues</span>
            </div>

            <div className="space-y-3 pt-2">
                {issues.map((issue) => (
                    <div key={issue.severity} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${issue.severity === "critical" ? "bg-red-600" :
                                    issue.severity === "high" ? "bg-orange-500" :
                                        issue.severity === "medium" ? "bg-yellow-500" :
                                            "bg-blue-500"
                                }`} />
                            <span className="text-sm capitalize">{issue.severity}</span>
                        </div>
                        <span className="text-sm font-medium">{issue.count}</span>
                    </div>
                ))}
            </div>
        </Card>
    );
}
