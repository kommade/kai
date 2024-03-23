"use client";

import FooterComponent from "@/components/FooterComponent"
import HeaderComponent from "@/components/HeaderComponent"
import { useToast } from "@/components/ui/use-toast";
import Kai from "@/lib/types"
import { useRouter } from "next/navigation";

import React from 'react'
import { Button } from "@/components/ui/button";
import { OrderStatusesDisplay } from "@/components/StatusMaps";
import { UserRoundSearch, Truck, FilePenLine, ChevronDown, ExternalLink, Package, Scale } from "lucide-react";
import Stripe from "stripe";

const DashboardPage = ({ auth, data, stripe }:
    {
        auth: Kai.UserResult,
        data: Kai.Orders,
        stripe: {
            disputes: Stripe.Dispute[],
            balance: {
                week: number,
                month: number
            }
        }
    }
) => {
    const { toast } = useToast();
    const router = useRouter();

    if (!auth.loggedIn) {
        router.push("/login?redirect=/dashboard");
        toast({ description: "Please log in to proceed!", duration: 2000, variant: "destructive" });
        return;
    }

    const moneyFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'SGD',
    });

    return (
        <main className="flex flex-col items-center justify-between min-h-screen">
            <div className="w-full h-fit min-h-[100vh] min-w-[1024px] relative flex flex-col">
                <HeaderComponent/>
                <section className="mt-[80px] min-h-[calc(100vh_-_140px)] w-full h-fit flex flex-col justify-start items-center py-6">
                    <div className="w-[90%] justify-between flex flex-col gap-4">
                        <h2 className="text-center w-fit text-[24px]">DASHBOARD</h2>
                        <div className="w-full h-fit">
                            <div className="flex flex-col gap-4">
                                <div className="flex pb-8 border-b-kai-grey border-b-2">
                                    <div className="flex flex-col gap-2 border-r-kai-grey border-r-2 pr-8 h-[190px]">
                                        <div className="flex gap-2 h-[28px]">
                                            <Package />
                                            <h3 className="text-lg text-bold">Orders</h3>
                                            <Button className="w-[100px] h-[28px] ml-auto p-0 -mr-6" variant={"link"} onClick={() => router.push("/dashboard/orders")}>View Orders</Button>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="flex flex-col h-[130px] w-[200px] gap-1">
                                                <OrderStatusesDisplay orders={Object.values(data)} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 border-r-kai-grey border-r-2 px-8 h-[190px]">
                                        <div className="flex gap-2 h-[28px]">
                                            <Scale/>
                                            <h3 className="text-lg text-bold">Disputes</h3>
                                        </div>
                                        <h3 className="flex h-fit items-center">There are {stripe.disputes.length} dispute(s) that require action.</h3>
                                        <div className="w-full h-full flex justify-center items-center">
                                            <Button variant={"link"} onClick={() => router.push(`https://dashboard.stripe.com${process.env.NODE_ENV === "production" ? "" : "/test"}/disputes`)}>View Disputes</Button>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 border-r-kai-grey border-r-2 px-8 h-[190px]">
                                        <div className="flex gap-2 h-[28px]">
                                            <Truck/>
                                            <h3 className="text-lg text-bold">Earnings</h3>
                                        </div>
                                        <div className="flex flex-col h-[84px] w-[130px] gap-1">
                                                <h3 className="text-lg">{moneyFormatter.format(stripe.balance.month)}</h3>
                                                <h3>in the past month</h3>
                                                <h3 className="text-lg">{moneyFormatter.format(stripe.balance.week)}</h3>
                                                <h3 className="text-lg">in the past week</h3>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 border-r-kai-grey border-r-2 px-8 h-[190px]">
                                        <div className="flex gap-2 h-[28px]">
                                            <FilePenLine/>
                                            <h3 className="text-lg text-bold">Actions</h3>
                                        </div>
                                        <div className="grid grid-rows-2 grid-cols-2 gap-2">
                                            <Button variant={'secondary'} className="flex justify-between">
                                                <span>
                                                    Update status
                                                </span>
                                                <ChevronDown width={16} height={16}/>
                                            </Button>
                                            <Button className="flex justify-between" onClick={() => {
                                            }}>
                                                <span>
                                                    View invoice
                                                </span>
                                                <ExternalLink width={16} height={16}/>
                                            </Button>
                                            <Button className="flex justify-between" onClick={() => {
                                            }}>
                                                <span>
                                                    View payment
                                                </span>
                                                <ExternalLink width={16} height={16}/>
                                            </Button>
                                            <Button variant={"destructive"} >Cancel and Refund</Button>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <h3 className="text-lg text-bold">Order Summary</h3>
                                    ""
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <FooterComponent />
            </div>
        </main>
    )
}

export default DashboardPage