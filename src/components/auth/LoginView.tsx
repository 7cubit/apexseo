"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/auth/AuthProvider";
import { ShieldCheck } from "lucide-react";

export function LoginView() {
    const { login } = useAuth();

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Card className="w-[350px]">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <ShieldCheck className="h-12 w-12 text-primary" />
                    </div>
                    <CardTitle>Welcome to ApexSEO</CardTitle>
                    <CardDescription>Sign in to access your projects</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button className="w-full" onClick={login}>
                        Sign In with Mock Auth
                    </Button>
                    <p className="text-xs text-center text-muted-foreground mt-4">
                        (This is a simulated login for MVP)
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
