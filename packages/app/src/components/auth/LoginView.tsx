"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Loader2 } from "lucide-react";

export function LoginView() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState("demo");
    const [password, setPassword] = useState("demo");
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const res = await signIn("credentials", {
            username,
            password,
            redirect: false,
        });

        if (res?.error) {
            setError("Invalid credentials");
            setLoading(false);
        } else {
            router.push("/projects");
        }
    };

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
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="demo"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="demo"
                            />
                        </div>
                        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                        <Button className="w-full" type="submit" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign In"}
                        </Button>
                    </form>
                    <p className="text-xs text-center text-muted-foreground mt-4">
                        Use <strong>demo</strong> / <strong>demo</strong> to log in.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
