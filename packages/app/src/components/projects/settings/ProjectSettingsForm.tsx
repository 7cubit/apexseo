"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Card, Input } from "@apexseo/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs"; // Assuming Radix primitives
import { createProjectSchema, CreateProjectInput } from "@/lib/validations/project";

export function ProjectSettingsForm({ project }: { project: any }) {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CreateProjectInput>({
        resolver: zodResolver(createProjectSchema) as any,
        defaultValues: {
            name: project.name || "",
            domain: project.domain || "",
            userAgent: project.userAgent || "ApexSEO-Bot/1.0",
            maxPages: project.maxPages || 100,
            ignorePatterns: project.ignorePatterns || "",
            frequency: project.frequency || "manual",
            time: project.time || "00:00",
        } as any,
    });

    const onSubmit = async (data: CreateProjectInput) => {
        console.log("Updating project:", data);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        alert("Project updated!");
    };

    return (
        <div className="space-y-6">
            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8">
                    <TabsTrigger value="general" className="px-4 py-2 border-b-2 data-[state=active]:border-primary">General</TabsTrigger>
                    <TabsTrigger value="crawler" className="px-4 py-2 border-b-2 data-[state=active]:border-primary">Crawler</TabsTrigger>
                    <TabsTrigger value="schedule" className="px-4 py-2 border-b-2 data-[state=active]:border-primary">Schedule</TabsTrigger>
                </TabsList>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <TabsContent value="general">
                        <Card className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Project Name</label>
                                <Input {...register("name")} />
                                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Domain</label>
                                <Input {...register("domain")} disabled />
                                <p className="text-xs text-muted-foreground">Domain cannot be changed after creation.</p>
                            </div>
                        </Card>
                    </TabsContent>

                    <TabsContent value="crawler">
                        <Card className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">User Agent</label>
                                <Input {...register("userAgent")} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Max Pages</label>
                                <Input type="number" {...register("maxPages", { valueAsNumber: true })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Ignore Patterns</label>
                                <Input {...register("ignorePatterns")} />
                            </div>
                        </Card>
                    </TabsContent>

                    <TabsContent value="schedule">
                        <Card className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Frequency</label>
                                <select
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    {...register("frequency")}
                                >
                                    <option value="manual">Manual</option>
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Time (UTC)</label>
                                <Input type="time" {...register("time")} />
                            </div>
                        </Card>
                    </TabsContent>

                    <div className="mt-6 flex justify-end space-x-4">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </Tabs>

            <div className="pt-8 border-t">
                <h3 className="text-lg font-medium text-red-600 mb-4">Danger Zone</h3>
                <Card className="p-6 border-red-200 bg-red-50">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-medium text-red-900">Delete Project</h4>
                            <p className="text-sm text-red-700">Permanently delete this project and all its data.</p>
                        </div>
                        <Button variant="destructive">Delete Project</Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
