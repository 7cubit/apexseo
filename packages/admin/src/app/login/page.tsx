import { SignIn } from "@clerk/nextjs";

export const dynamic = 'force-dynamic';

export default function LoginPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-gray-100">
                    Admin Dashboard Login
                </h1>
                <div className="flex justify-center">
                    <SignIn
                        appearance={{
                            elements: {
                                formButtonPrimary: 'bg-primary hover:bg-primary/90 text-primary-foreground',
                                footerActionLink: 'text-primary hover:text-primary/90'
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
