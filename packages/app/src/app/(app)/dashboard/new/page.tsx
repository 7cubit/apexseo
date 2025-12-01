import { Button } from "@/components/ui/button";

export default function NewProjectPage() {
    return (
        <div className="mx-auto max-w-2xl p-4">
            <h1 className="mb-4 text-2xl font-bold">Add New Project</h1>
            <form className="space-y-4">
                <div className="flex flex-col gap-2">
                    <label htmlFor="url" className="text-sm font-medium">
                        Website URL
                    </label>
                    <input
                        id="url"
                        type="url"
                        placeholder="https://example.com"
                        className="rounded-md border p-2"
                        required
                    />
                </div>
                <Button type="submit">Create Project</Button>
            </form>
        </div>
    );
}
