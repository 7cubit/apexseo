"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function ExportPdfButton() {
    const handleExport = () => {
        // Simple client-side print for MVP
        window.print();
    };

    return (
        <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export PDF
        </Button>
    );
}
