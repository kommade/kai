"use client";

import FooterComponent from "@/components/FooterComponent"
import HeaderComponent from "@/components/HeaderComponent"
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { loginFormSchema } from "@/lib/zod";
import { useForm } from "react-hook-form"
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { login } from "@/functions/auth";
import { useState } from "react";
import Kai from "@/lib/types";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";


const LoginPage = ({ session }: { session?: string }) => {  
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get("redirect") ?? "/";
    const { toast } = useToast();
    const [response, setResponse] = useState<string>("");
    const form = useForm<z.infer<typeof loginFormSchema>>({
        resolver: zodResolver(loginFormSchema),
        defaultValues: {
            email: "",
            password: ""
        }
    });
    
    if (session) {
        if (z.string().email().safeParse(session).success) {
            router.push(redirect)
            toast({ description: "You are already logged in!", duration: 1000 });
            return;
        }
    }

    async function onSubmit(data: z.infer<typeof loginFormSchema>) {  
        const res = await login(data.email, data.password);
        if (res.success) {
            setResponse("");
            const user = res.data as Kai.User;
            if (user.role === "admin") {
                router.push("/dashboard");
            } else {
                router.push(redirect)
            }
        } else {
            setResponse("Email or password is incorrect");
        }
    }

    return (
        <main className="flex flex-col items-center justify-between min-h-screen">
            <div className="w-full h-fit min-h-[100vh] min-w-[1024px] relative flex flex-col">
                <HeaderComponent/>
                <section className="mt-[80px] min-h-[calc(100vh_-_140px)] w-full h-fit flex flex-col justify-start items-center py-6">
                    <div className="w-[90%] justify-between flex flex-col gap-4">
                        <h2 className="text-center w-fit text-[24px]">LOGIN</h2>
                        <div className="flex flex-col items-center justify-center">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="w-[300px] max-h-[290px] flex flex-col gap-4" onKeyDown={() => setResponse('')}>
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Email" autoComplete="username" {...field} />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Password</FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="Password" autoComplete="current-password" {...field} />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                        />
                                    <Button className="mt-4" type="submit">Login</Button>
                                    <FormMessage>{response}</FormMessage>
                                </form>
                            </Form>
                            <div className="flex gap-4 w-[300px] justify-between">
                                <Button variant="link" className="mt-4">Forgot Password</Button>
                                <Button variant="link" className="mt-4">Create Account</Button>
                            </div>
                        </div>
                    </div>
                </section>
                <FooterComponent />
            </div>
        </main>
    )
}

export default LoginPage
