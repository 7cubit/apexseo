import { HealthScoreCard } from "@/components/projects/dashboard/HealthScoreCard";
import { CrawlStatusCard } from "@/components/projects/dashboard/CrawlStatusCard";
import { IssuesSummaryCard } from "@/components/projects/dashboard/IssuesSummaryCard";
import { RecentActivityList } from "@/components/projects/dashboard/RecentActivityList";

export default function ProjectDashboardPage({ params }: { params: { id: string } }) {
    // Mock data for now
    const data = {
        healthScore: 85,
        crawlStatus: {
            status: "completed" as const,
            progress: 100,
            crawledPages: 142,
            totalPages: 150,
        },
        issues: [
            { severity: "critical" as const, count: 2, label: "Broken Links" },
            { severity: "high" as const, count: 5, label: "Missing H1" },
            { severity: "medium" as const, count: 12, label: "Duplicate Title" },
            { severity: "low" as const, count: 24, label: "Low Word Count" },
        ],
        activities: [
            { id: "1", type: "crawl" as const, status: "completed" as const, timestamp: new Date().toISOString(), details: "Scheduled Crawl" },
            { id: "2", type: "audit" as const, status: "completed" as const, timestamp: new Date(Date.now() - 86400000).toISOString(), details: "Content Audit" },
            { id: "3", type: "report" as const, status: "completed" as const, timestamp: new Date(Date.now() - 172800000).toISOString(), details: "Weekly Report Generated" },
        ],
    };

    return (
        <div className="space-y-8 p-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Project Overview</h1>
                <p className="text-muted-foreground">Dashboard for project {params.id}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <HealthScoreCard score={data.healthScore} />
                <CrawlStatusCard {...data.crawlStatus} />
                <IssuesSummaryCard issues={data.issues} />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4">
                    <RecentActivityList activities={data.activities} />
                </div>
                <div className="col-span-3">
                    {/* Placeholder for another widget, maybe quick actions or graph preview */}
                    <div className="h-full min-h-[200px] rounded-xl border bg-card text-card-foreground shadow p-6">
                        <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
                        <div className="space-y-2">
                            <button className="w-full text-left px-4 py-2 hover:bg-secondary rounded-md text-sm">Start New Crawl</button>
                            <button className="w-full text-left px-4 py-2 hover:bg-secondary rounded-md text-sm">View All Pages</button>
                            <button className="w-full text-left px-4 py-2 hover:bg-secondary rounded-md text-sm">Project Settings</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
