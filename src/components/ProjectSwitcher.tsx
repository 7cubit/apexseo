"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// Mock projects for MVP
const projects = [
    {
        label: "Junket Japan",
        value: "junket-japan",
    },
    {
        label: "ApexSEO Demo",
        value: "apex-demo",
    },
];

export function ProjectSwitcher({ className }: { className?: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentProject = searchParams.get("project") || "junket-japan";

    const onSelect = (value: string) => {
        // Navigate to the selected project's dashboard
        router.push(`/sites/${value}`);
    };

    return (
        <Select onValueChange={onSelect} defaultValue={currentProject}>
            <SelectTrigger className={className}>
                <SelectValue placeholder="Select Project" />
            </SelectTrigger>
            <SelectContent>
                {projects.map((project) => (
                    <SelectItem key={project.value} value={project.value}>
                        {project.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
