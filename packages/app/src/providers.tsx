"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/theme-provider";
import { SWRConfig } from "swr";
import { Toaster } from "sonner";
import { apiClient } from "@/lib/api";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <SWRConfig
                value={{
                    fetcher: (resource, init) => apiClient(resource, init),
                    revalidateOnFocus: false,
                }}
            >
                <ThemeProvider
                    defaultTheme="system"
                >
                    {children}
                    <Toaster />
                </ThemeProvider>
            </SWRConfig>
        </SessionProvider>
    );
}
