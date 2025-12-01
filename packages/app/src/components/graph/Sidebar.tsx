import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface SidebarProps {
    node: any;
    onClose: () => void;
}

export function Sidebar({ node, onClose }: SidebarProps) {
    if (!node) return null;

    return (
        <div className="absolute right-0 top-0 h-full w-80 border-l bg-background p-4 shadow-lg z-10 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Page Details</h2>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="space-y-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">URL</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm break-all">{node.data.url || node.id}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Title</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm">{node.data.title || "No title"}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm">Word Count:</span>
                            <span className="text-sm font-bold">{node.data.wordCount || 0}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm">TSPR (Rank):</span>
                            <span className="text-sm font-bold">0.85</span>
                        </div>
                    </CardContent>
                </Card>

                <div className="pt-4">
                    <Button
                        className="w-full"
                        variant="outline"
                        onClick={() => window.open(node.data.url || node.id, '_blank')}
                    >
                        Visit Page
                    </Button>
                </div>
            </div>
        </div>
    );
}
