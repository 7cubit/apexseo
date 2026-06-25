"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import axios from "axios";

const fetchVisitors = async () => {
    const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/system/visitors`, { withCredentials: true });
    return data;
};

export function ActiveVisitorsWidget() {
    const { data } = useQuery({
        queryKey: ["visitors"],
        queryFn: fetchVisitors,
        refetchInterval: 10000,
    });

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    Live Active Admins
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{data?.active_visitors || 0}</div>
                <p className="text-xs text-muted-foreground">
                    Estimated real-time
                </p>
            </CardContent>
        </Card>
    );
}
