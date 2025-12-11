import { api } from "@/lib/api";
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription } from "@apexseo/ui";
import { Users, Layout, ShieldCheck, ArrowUpRight, Activity } from "lucide-react";
import { FinancialFlowChart } from "@/components/dashboard/FinancialFlowChart";

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                    <p className="text-muted-foreground mt-2">
                        Welcome back to the admin control center.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button>Download Report</Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-none shadow-sm bg-gray-100/50 dark:bg-[#151923]">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Users
                        </CardTitle>
                        <Users className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">1,234</div>
                        <p className="text-xs text-green-500 font-medium mt-1">
                            +20.1% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-gray-100/50 dark:bg-[#151923]">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Active Projects
                        </CardTitle>
                        <Layout className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">345</div>
                        <p className="text-xs text-green-500 font-medium mt-1">
                            +180 since last hour
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-gray-100/50 dark:bg-[#151923]">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Admins
                        </CardTitle>
                        <ShieldCheck className="h-4 w-4 text-indigo-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            +2 new this week
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-gray-100/50 dark:bg-[#151923]">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            System Health
                        </CardTitle>
                        <Activity className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-500">99.9%</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            All systems operational
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <FinancialFlowChart />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 border-none shadow-sm bg-gray-100/50 dark:bg-[#151923]">
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                        <CardDescription>
                            User registration trend over the last 30 days.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[200px] w-full bg-gradient-to-t from-blue-500/10 to-transparent rounded-lg flex items-end justify-center pb-4 text-muted-foreground border border-dashed border-gray-200 dark:border-gray-800">
                            <span className="text-sm">Chart Visualization Placeholder</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3 border-none shadow-sm bg-gray-100/50 dark:bg-[#151923]">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>
                            Latest actions performed by users.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                        <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none text-foreground">
                                            User registered
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            user{i}@example.com joined the platform.
                                        </p>
                                    </div>
                                    <div className="ml-auto font-medium text-xs text-muted-foreground">
                                        {i}h ago
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div >
    );
}
