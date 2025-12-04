import { NextResponse } from "next/server";
import { crawlStatus } from "@/lib/crawler";

export async function GET(request: Request, { params }: { params: { url: string } }) {
    const decodedUrl = decodeURIComponent(params.url);

    const stream = new ReadableStream({
        start(controller) {
            const interval = setInterval(() => {
                const status = crawlStatus[decodedUrl];
                if (status) {
                    const data = JSON.stringify(status);
                    controller.enqueue(`data: ${data}\n\n`);

                    if (status.status === "Completed") {
                        clearInterval(interval);
                        controller.close();
                    }
                }
            }, 1000);
        },
    });

    return new NextResponse(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    });
}
