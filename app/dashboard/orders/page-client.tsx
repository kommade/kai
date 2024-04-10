"use client";

import OrdersComponent from "@/components/OrdersComponent";
import FooterComponent from "@/components/FooterComponent"
import HeaderComponent from "@/components/HeaderComponent"
import { useToast } from "@/components/ui/use-toast";
import Kai from "@/lib/types"
import { useRouter } from "next/navigation";
import React, { useEffect } from 'react'
import { zodValidateOrder } from "@/lib/zod";
import { z } from "zod";

const OrdersPage = ({ auth, data }: { auth: Kai.UserResult, data: Kai.Order[] }) => {
    const { toast } = useToast();
    const orders: z.infer<typeof zodValidateOrder>[] = data.map(order => {
        try {
            return zodValidateOrder.parse(order);
        } catch (error) {
            console.error(error);
            toast({ description: "There was an error parsing orders. Please report this to an administrator.", duration: 2000, variant: "destructive" });
            return null;
        }
    }).filter((order): order is NonNullable<typeof order> => order !== null);
    const router = useRouter();

    useEffect(() => {
        if (!auth.loggedIn) {
            router.push("/login?redirect=/dashboard");
            toast({ description: "Please log in to proceed!", duration: 2000, variant: "destructive" });
            return;
        }
    }, [auth.loggedIn])

    return (
        <main className="flex flex-col items-center justify-between min-h-screen">
            <div className="w-full h-fit min-h-[100vh] min-w-[1024px] relative flex flex-col">
                <HeaderComponent/>
                <section className="mt-[80px] min-h-[calc(100vh_-_140px)] w-full h-fit flex flex-col justify-start items-center py-6">
                    <div className="w-[90%] justify-between flex flex-col gap-4">
                        <h2 className="text-center w-fit text-[24px]">ORDERS</h2>
                        <OrdersComponent data={orders}/>
                    </div>
                </section>
                <FooterComponent />
            </div>
        </main>
    )
}

export default OrdersPage