"use client";

import FooterComponent from "@/components/FooterComponent"
import HeaderComponent from "@/components/HeaderComponent"
import MessageComponent from "@/components/MessageComponent"
import { Button } from "@/components/ui/button"
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import { convertCartToOrder, preventCartTimeout } from "@/functions/database"
import { clearSessionId, getSessionId } from "@/functions/sessions"
import Kai from "@/lib/types"
import Link from "next/link";
import { useRouter } from "next/navigation"
import React, { useEffect } from 'react'

const ReturnPage = ({ session }: { session?: Kai.CheckoutSession }) => {
    const { toast } = useToast();
    const router = useRouter();
    
    if (!session) {
        return (
            <MessageComponent message="Something went wrong" />
        )
    }
    
    useEffect(() => {
        const handleComplete = async (status: string) => {
            if (status === "paid") {
                const session_id = await getSessionId();
                if (session_id) {
                    const res = await convertCartToOrder(session_id);
                    if (res.success) {
                        clearSessionId();
                        return;
                    }
                    await preventCartTimeout(session_id);
                }
                const emailLink = `mailto:kaistudios46@gmail.com?subject=Order paid for but not saved?body=I recently ordered from your website. Order ID: ${session_id ?? "Not saved"} Please help me with this issue. Thank you.`
                toast({
                    description: "Your order was not saved due to an error. Please contact us at kaistudios46@gmail.com.",
                    variant: "destructive",
                    action: <ToastAction altText="Contact Us"><Link href={emailLink}>Contact us</Link></ToastAction>,
                    duration: 10000
                })
            }
        }
        handleComplete(session.status);
    }, []);

    if (session.status === "paid") {
        return (
            <main className="flex flex-col items-center justify-between min-h-screen">
                <div className="w-full h-fit min-h-[100vh] min-w-[1024px] relative flex flex-col">
                    <HeaderComponent/>
                    <section className="mt-[80px] min-h-[calc(100vh_-_140px)] w-full h-fit flex flex-col justify-start items-center py-6">
                        <div className="w-[90%] justify-between flex flex-col gap-4">
                            <h2 className="text-center w-fit text-[24px]">CHECKOUT</h2>
                            <div className="flex flex-col h-[200px] items-center justify-center gap-4">
                                <p className="text-center">Thank you for your purchase!</p>
                                <Button className="w-[200px]" variant={"default"} onClick={() => router.push('/')}>Continue Shopping</Button>
                            </div>
                        </div>
                    </section>
                    <FooterComponent />
                </div>
            </main>
        )
    } else {
        return (
            <main className="flex flex-col items-center justify-between min-h-screen">
                <div className="w-full h-fit min-h-[100vh] min-w-[1024px] relative flex flex-col">
                    <HeaderComponent/>
                    <section className="mt-[80px] min-h-[calc(100vh_-_140px)] w-full h-fit flex flex-col justify-start items-center py-6">
                        <div className="w-[90%] justify-between flex flex-col gap-4">
                            <h2 className="text-center w-fit text-[24px]">CHECKOUT</h2>
                            <p className="text-center">Your purchase was unsuccessful.</p>
                            <Button variant={"default"} onClick={() => router.push('/checkout')}>Try Again</Button>
                        </div>
                    </section>
                    <FooterComponent />
                </div>
            </main>
        )
    }
}

export default ReturnPage