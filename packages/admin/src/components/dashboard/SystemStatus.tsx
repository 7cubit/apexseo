"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import { Activity, Database, Server, CreditCard, Mail } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const fetchHealth = async () => {
    const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/health`);
    return data;
};

const fetchMetrics = async () => {
    // Use admin client or fetch with credentials
    // For simplicity assuming axios interceptor handles auth or public endpoint (protected by RBAC actually)
    // Need to use auth token... Assuming global axios setup or use useAuth
    const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/system/metrics`, { withCredentials: true });
    return data;
};

export function SystemStatusWidget() {
    const { data: health, isLoading: healthLoading } = useQuery({
        queryKey: ["health"],
        queryFn: fetchHealth,
        refetchInterval: 30000, // 30s
    });

    const { data: metrics, isLoading: metricsLoading } = useQuery({
        queryKey: ["metrics"],
        queryFn: fetchMetrics,
        refetchInterval: 30000,
    });

    if (healthLoading || metricsLoading) return <div>Loading System Status...</div>;

    const getStatusColor = (status: string) => {
        switch (status) {
            case "healthy":
            case "configured":
                return "bg-green-500";
            case "unhealthy":
                return "bg-red-500";
            case "degraded":
                return "bg-yellow-500";
            default:
                return "bg-gray-300";
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        System Health
                    </div>
                    <Badge variant={health?.status === "ok" ? "default" : "destructive"}>
                        {health?.status?.toUpperCase() || "UNKNOWN"}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Services Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                            <Database className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Database</span>
                        </div>
                        <div className={`h-2 w-2 rounded-full ${getStatusColor(health?.services?.database)}`} />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                            <Server className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Redis</span>
                        </div>
                        <div className={`h-2 w-2 rounded-full ${getStatusColor(health?.services?.redis)}`} />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Stripe</span>
                        </div>
                        <div className={`h-2 w-2 rounded-full ${getStatusColor(health?.services?.stripe)}`} />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Email</span>
                        </div>
                        <div className={`h-2 w-2 rounded-full ${getStatusColor(health?.services?.email)}`} />
                    </div>
                </div>

                {/* Real-time Metrics */}
                <div>
                    <h4 className="text-sm font-semibold mb-3">Live Metrics (5m Window)</h4>
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 bg-slate-50 rounded">
                            <div className="text-xl font-bold">{metrics?.avgLatency || 0}ms</div>
                            <div className="text-xs text-muted-foreground">Avg Latency</div>
                        </div>
                        <div className="p-2 bg-slate-50 rounded">
                            <div className="text-xl font-bold">{metrics?.p95Latency || 0}ms</div>
                            <div className="text-xs text-muted-foreground">P95 Latency</div>
                        </div>
                        <div className="p-2 bg-slate-50 rounded">
                            <div className={`text-xl font-bold ${metrics?.status5xx > 0 ? 'text-red-600' : ''}`}>
                                {(metrics?.status5xx || 0) / (metrics?.total || 1) * 100 > 1 ? (
                                    <span className="text-red-500">{(metrics?.status5xx || 0)}</span>
                                ) : (
                                    metrics?.status5xx || 0
                                )}
                            </div>
                            <div className="text-xs text-muted-foreground">5xx Errors</div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
