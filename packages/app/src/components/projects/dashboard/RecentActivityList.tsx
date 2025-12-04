import { Card } from "@apexseo/ui";
import { formatDistanceToNow } from "date-fns";

interface Activity {
    id: string;
    type: "crawl" | "audit" | "report";
    status: "completed" | "failed" | "running";
    timestamp: string;
    details: string;
}

interface RecentActivityListProps {
    activities: Activity[];
}

export function RecentActivityList({ activities }: RecentActivityListProps) {
    return (
        <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
            <div className="space-y-4">
                {activities.map((activity) => (
                    <div key={activity.id} className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0">
                        <div className="space-y-1">
                            <p className="text-sm font-medium">{activity.details}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                                {activity.type} • {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                            </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full capitalize ${activity.status === "completed" ? "bg-green-100 text-green-700" :
                                activity.status === "failed" ? "bg-red-100 text-red-700" :
                                    "bg-blue-100 text-blue-700"
                            }`}>
                            {activity.status}
                        </span>
                    </div>
                ))}
            </div>
        </Card>
    );
}
