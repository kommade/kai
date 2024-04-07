"use client";

import FooterComponent from "@/components/FooterComponent"
import HeaderComponent from "@/components/HeaderComponent"
import { useToast } from "@/components/ui/use-toast";
import Kai from "@/lib/types"
import { useRouter } from "next/navigation";

import React from 'react'
import { Button } from "@/components/ui/button";
import { OrderStatusesDisplay } from "@/components/StatusMaps";
import { UserRoundSearch, Truck, FilePenLine, ChevronDown, ExternalLink, Package, Scale, PiggyBank, Plus, Pencil, PercentCircle } from "lucide-react";
import Stripe from "stripe";
import { zodValidateOrder } from "@/lib/zod";
import { z } from "zod";

const DashboardPage = ({ data, stripe }:
    {
        data: Kai.Order[],
        stripe: {
            disputes: Stripe.Dispute[],
            balance: {
                available: number,
                pending: number
            }
        }
    }
) => {
    const { toast } = useToast();
    const router = useRouter();
    const validate: (z.infer<typeof zodValidateOrder> | null)[] = data.map(order => {
        try {
            return zodValidateOrder.parse(order);
        } catch (error) {
            console.log(error)
            return null;
        }
    })

    if (validate.includes(null)) {
        toast({ description: "There was an error parsing orders. Please report this to an administrator.", duration: 2000, variant: "destructive" });
    }
    const orders = validate.filter((order): order is NonNullable<typeof order> => order !== null);

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
                                            <Button className="w-[100px] h-[28px] ml-auto p-0 -mr-10" variant={"link"} onClick={() => router.push("/dashboard/orders")}>View</Button>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="flex flex-col h-[130px] w-[300px] gap-1">
                                                <OrderStatusesDisplay orders={orders} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 w-[250px] border-r-kai-grey border-r-2 px-8 h-[190px]">
                                        <div className="flex gap-2 h-[28px]">
                                            <Scale/>
                                            <h3 className="text-lg text-bold">Disputes</h3>
                                            <Button className="w-[100px] h-[28px] ml-auto p-0 -mr-10" variant={"link"} onClick={() => router.push(`https://dashboard.stripe.com${process.env.NODE_ENV === "production" ? "" : "/test"}/disputes`)}>View</Button>
                                        </div>
                                        <h3 className="flex h-fit items-center">There are {stripe.disputes.length} dispute(s) that require action.</h3>
                                        <div className="w-full h-full flex justify-center items-center">
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 border-r-kai-grey border-r-2 px-8 h-[190px]">
                                        <div className="flex gap-2 h-[28px]">
                                            <PiggyBank/>
                                            <h3 className="text-lg text-bold">Balance</h3>
                                            <Button className="w-[100px] h-[28px] ml-auto p-0 -mr-10" variant={"link"} onClick={() => router.push(`https://dashboard.stripe.com${process.env.NODE_ENV === "production" ? "" : "/test"}/balance/overview`)}>View</Button>
                                        </div>
                                        <div className="flex flex-col h-[84px] w-[130px] gap-1">
                                            <h3 className="text-[24px]">{moneyFormatter.format(stripe.balance.available)}</h3>
                                            <h3>in available funds</h3>
                                            <h3 className="text-[24px]">{moneyFormatter.format(stripe.balance.pending)}</h3>
                                            <h3>balance pending</h3>
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
                                                    Edit products
                                                </span>
                                                <Pencil width={16} height={16}/>
                                            </Button>
                                            <Button className="flex justify-between" onClick={() => {
                                            }}>
                                                <span>
                                                    New product
                                                </span>
                                                <Plus width={16} height={16}/>
                                            </Button>
                                            <Button className="flex justify-between" onClick={() => {
                                                const stripeUrl = `https://dashboard.stripe.com${process.env.NODE_ENV === "production" ? "" : "/test"}/customers`;
                                                window.open(stripeUrl, "_blank");
                                            }}>
                                                <span>
                                                    User accounts
                                                </span>
                                                <ExternalLink width={16} height={16}/>
                                            </Button>
                                            <Button variant={"secondary"} className="flex justify-between">
                                                <span>
                                                    New discount
                                                </span>
                                                <PercentCircle width={16} height={16}/>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">

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