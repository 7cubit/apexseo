import { ProjectSettingsForm } from "@/components/projects/settings/ProjectSettingsForm";

export default function ProjectSettingsPage({ params }: { params: { id: string } }) {
    // Mock data
    const project = {
        id: params.id,
        name: "My Awesome Project",
        domain: "https://example.com",
        userAgent: "ApexSEO-Bot/1.0",
        maxPages: 100,
        ignorePatterns: "/admin",
        frequency: "weekly",
        time: "09:00",
    };

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Project Settings</h1>
                <p className="text-muted-foreground">Manage configuration for {project.name}</p>
            </div>

            <ProjectSettingsForm project={project} />
        </div>
    );
}
