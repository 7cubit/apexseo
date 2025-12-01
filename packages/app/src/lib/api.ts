import { getSession } from "next-auth/react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function apiClient(endpoint: string, options: RequestInit = {}) {
    const session = await getSession();
    const token = (session as any)?.user?.id; // Using ID as token for now, or use JWT if available

    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(error.error || `API Error: ${response.status}`);
    }

    return response.json();
}

export const fetcher = (url: string) => apiClient(url);
