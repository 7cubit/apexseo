"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Button } from "@apexseo/ui"; // Assuming UI package exports Button
import { Input } from "@apexseo/ui"; // Assuming UI package exports Input
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@apexseo/ui"; // Assuming UI package exports Card components

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1, "Password is required"),
});

const verifySchema = z.object({
    token: z.string().length(6, "Token must be 6 digits"),
});

type LoginInput = z.infer<typeof loginSchema>;
type VerifyInput = z.infer<typeof verifySchema>;

export default function LoginPage() {
    const [step, setStep] = useState<"login" | "2fa">("login");
    const [adminId, setAdminId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const { register: registerLogin, handleSubmit: handleSubmitLogin, formState: { errors: loginErrors, isSubmitting: isLoginSubmitting } } = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
    });

    const { register: registerVerify, handleSubmit: handleSubmitVerify, formState: { errors: verifyErrors, isSubmitting: isVerifySubmitting } } = useForm<VerifyInput>({
        resolver: zodResolver(verifySchema),
    });

    const onLogin = async (data: LoginInput) => {
        setError(null);
        try {
            const res = await api.post("/admin/auth/login", data);
            if (res.data.require2fa) {
                setAdminId(res.data.admin.id);
                setStep("2fa");
            } else {
                router.push("/dashboard");
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Login failed");
        }
    };

    const onVerify = async (data: VerifyInput) => {
        setError(null);
        try {
            await api.post("/admin/auth/2fa/verify", {
                adminId,
                token: data.token,
            });
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.response?.data?.message || "Verification failed");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Card className="w-[400px]">
                <CardHeader>
                    <CardTitle>Admin Login</CardTitle>
                    <CardDescription>
                        {step === "login" ? "Enter your credentials to access the admin panel." : "Enter the 2FA code from your authenticator app."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-4">
                            {error}
                        </div>
                    )}

                    {step === "login" ? (
                        <form onSubmit={handleSubmitLogin(onLogin)} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email</label>
                                <Input {...registerLogin("email")} placeholder="admin@apexseo.co" />
                                {loginErrors.email && <p className="text-xs text-destructive">{loginErrors.email.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Password</label>
                                <Input {...registerLogin("password")} type="password" />
                                {loginErrors.password && <p className="text-xs text-destructive">{loginErrors.password.message}</p>}
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoginSubmitting}>
                                {isLoginSubmitting ? "Logging in..." : "Login"}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleSubmitVerify(onVerify)} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">2FA Code</label>
                                <Input {...registerVerify("token")} placeholder="000000" maxLength={6} className="text-center tracking-widest text-lg" />
                                {verifyErrors.token && <p className="text-xs text-destructive">{verifyErrors.token.message}</p>}
                            </div>
                            <Button type="submit" className="w-full" disabled={isVerifySubmitting}>
                                {isVerifySubmitting ? "Verifying..." : "Verify"}
                            </Button>
                            <Button type="button" variant="ghost" className="w-full" onClick={() => setStep("login")}>
                                Back to Login
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
