import { Card } from "@apexseo/ui";
import { Progress } from "@radix-ui/react-progress"; // Check if Progress is in UI package, if not use Radix directly or mock

interface CrawlStatusCardProps {
    status: "idle" | "crawling" | "completed" | "failed";
    progress: number;
    crawledPages: number;
    totalPages: number;
}

export function CrawlStatusCard({ status, progress, crawledPages, totalPages }: CrawlStatusCardProps) {
    return (
        <Card className="p-6 space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-muted-foreground">Crawl Status</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${status === "crawling" ? "bg-blue-100 text-blue-700" :
                        status === "completed" ? "bg-green-100 text-green-700" :
                            status === "failed" ? "bg-red-100 text-red-700" :
                                "bg-gray-100 text-gray-700"
                    }`}>
                    {status}
                </span>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                {/* Simple Progress Bar */}
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                    <p className="text-2xl font-bold">{crawledPages}</p>
                    <p className="text-xs text-muted-foreground">Pages Crawled</p>
                </div>
                <div>
                    <p className="text-2xl font-bold">{totalPages}</p>
                    <p className="text-xs text-muted-foreground">Total Discovered</p>
                </div>
            </div>
        </Card>
    );
}
