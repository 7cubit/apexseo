"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider> & { children: any }) {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
