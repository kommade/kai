"use client";

import OrdersComponent from "@/components/OrdersComponent";
import FooterComponent from "@/components/FooterComponent"
import HeaderComponent from "@/components/HeaderComponent"
import { useToast } from "@/components/ui/use-toast";
import Kai from "@/lib/types"
import { useRouter } from "next/navigation";

import React from 'react'
import { Button } from "@/components/ui/button";

const DashboardPage = ({ auth, data }: { auth: Kai.UserResult, data: Kai.Orders }) => {
    const { toast } = useToast();
    const router = useRouter();

    if (!auth.loggedIn) {
        router.push("/login?redirect=/dashboard");
        toast({ description: "Please log in to proceed!", duration: 2000, variant: "destructive" });
        return;
    }

    return (
        <main className="flex flex-col items-center justify-between min-h-screen">
            <div className="w-full h-fit min-h-[100vh] min-w-[1024px] relative flex flex-col">
                <HeaderComponent/>
                <section className="mt-[80px] min-h-[calc(100vh_-_140px)] w-full h-fit flex flex-col justify-start items-center py-6">
                    <div className="w-[90%] justify-between flex flex-col gap-4">
                        <h2 className="text-center w-fit text-[24px]">DASHBOARD</h2>
                        <div className="flex gap-2 items-center">
                            <h3>There are {Object.values(data).filter((order) => order.order_status === "pending").length} pending order(s).</h3>
                            <Button className="w-[100px]" variant={"link"} onClick={() => router.push("/dashboard/orders")}>View Orders</Button>
                        </div>
                    </div>
                </section>
                <FooterComponent />
            </div>
        </main>
    )
}

export default DashboardPage