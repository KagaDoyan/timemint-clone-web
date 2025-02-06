'use client';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { useState } from "react";

export default function Page() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirm_password: '',
    });

    function delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    const [errors, setErrors] = useState<any[]>([]);

    const { toast } = useToast()

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        // Clear previous errors
        setErrors([]);

        // Validate the form data locally
        const newErrors: any[] = [];
        if (!formData.email) newErrors.push({ path: 'email', message: 'Email is required.' });
        if (!formData.password) newErrors.push({ path: 'password', message: 'Password is required.' });
        if (formData.password !== formData.confirm_password) {
            newErrors.push({ path: 'confirm_password', message: 'Passwords do not match.' });
        }

        // If there are validation errors, set them and stop the submission
        if (newErrors.length > 0) {
            setErrors(newErrors);
            return;
        }

        // Send data to the server
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/employees/set-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                }),
            });

            if (!response.ok) {
                const errorResponse = await response.json();
                toast({
                    title: 'Error',
                    description: errorResponse.error || 'An unexpected error occurred.',
                    variant: 'destructive',
                })
                if (errorResponse.error == "password already set") {
                    await delay(2000);
                    router.push('/login');
                }
            } else {
                toast({
                    title: 'Password Set',
                    description: 'Password set successfully. Redirecting to login...',
                    variant: 'default',
                })
                await delay(2000);
                router.push('/login');
            }
        } catch (error: any) {
            setErrors([{ message: error.message || 'An unexpected error occurred.' }]);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="bg-card p-8 rounded-lg shadow-md w-96">
                <h2 className="text-2xl font-bold mb-6 text-center">Set Password</h2>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    {/* Email Field */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm"
                            placeholder="Enter your email"
                        />
                        {errors.find((e: any) => e.path === 'email') && (
                            <p className="text-red-600 text-sm mt-1">
                                {errors.find((e: any) => e.path === 'email')?.message}
                            </p>
                        )}
                    </div>

                    {/* Password Field */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm"
                            placeholder="Enter your password"
                        />
                        {errors.find((e: any) => e.path === 'password') && (
                            <p className="text-red-600 text-sm mt-1">
                                {errors.find((e: any) => e.path === 'password')?.message}
                            </p>
                        )}
                    </div>

                    {/* Confirm Password Field */}
                    <div>
                        <label htmlFor="confirm_password" className="block text-sm font-medium text-foreground mb-2">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            name="confirm_password"
                            value={formData.confirm_password}
                            onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm"
                            placeholder="Enter your password again"
                        />
                        {errors.find((e: any) => e.path === 'confirm_password') && (
                            <p className="text-red-600 text-sm mt-1">
                                {errors.find((e: any) => e.path === 'confirm_password')?.message}
                            </p>
                        )}
                    </div>

                    {/* General Errors */}
                    {errors.some((e: any) => !e.path) && (
                        <div className="text-red-600 text-sm">
                            {errors.find((e: any) => !e.path)?.message}
                        </div>
                    )}
                    <Button type="submit" className="w-full">
                        Save
                    </Button>
                </form>
            </div>
        </div>
    );
}
