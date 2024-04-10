"use client";

import FooterComponent from "@/components/FooterComponent"
import HeaderComponent from "@/components/HeaderComponent"
import MessageComponent from "@/components/MessageComponent";
import OrderComponent from "@/components/OrderComponent";
import { ChangeOrderStatusComponent, ChangeOrderStatusDialogs, OrderStatusMap, PaymentStatusMap, RefundStatusMap } from "@/components/StatusMaps"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { getOrderWithProducts } from "@/functions/database";
import { getRefundStatus } from "@/functions/stripe";
import Kai from "@/lib/types"
import { zodValidateOrderWithProducts } from "@/lib/zod";
import { ChevronDown, ExternalLink, FilePenLine, HandCoins, Truck, UserRoundSearch } from "lucide-react"
import React from 'react'
import { z } from "zod";

const OrderPage = ({ data, order_id, refund }: { data: Kai.OrderWithProducts, order_id: number, refund?: "pending" | "requires_action" | "succeeded" | "failed" | "cancelled" }) => {
    const validateOrder = (order: Kai.OrderWithProducts | null) => {
        try {
            return zodValidateOrderWithProducts.parse(order);
        } catch (error) {
            return null;
        }
    }
    const [order, setOrder] = React.useState<z.infer<typeof zodValidateOrderWithProducts> | null>(validateOrder(data));
    const [refund_status, setRefundStatus] = React.useState(refund);
    const [cancelOrderDialogOpen, setCancelOrderDialogOpen] = React.useState(false);
    const [shippingDialogOpen, setShippingDialogOpen] = React.useState(false);
    const moneyFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'SGD',
    });
    const displayNames = new Intl.DisplayNames(['en'], { type: 'region' });
    
    if (order === null) {
        return <MessageComponent message="Error retrieving order"/>
    }

    return (
        <main className="flex flex-col items-center justify-between min-h-screen">
            <div className="w-full h-fit min-h-[100vh] min-w-[1024px] relative flex flex-col">
                <HeaderComponent/>
                <section className="mt-[80px] min-h-[calc(100vh_-_140px)] w-full h-fit flex flex-col justify-start items-center py-6">
                    <div className="w-[90%] justify-between flex flex-col gap-4">
                        <h2 className="text-center w-fit text-[24px]">ORDER {`#${order_id}`}</h2>
                        <div className="w-full h-fit">
                            <div className="flex flex-col gap-4">
                                <div className="flex pb-8 border-b-kai-grey border-b-2">
                                    <div className="flex flex-col gap-2 border-r-kai-grey border-r-2 pr-8">
                                        <div className="flex gap-2 h-[28px]">
                                            <HandCoins />
                                            <h3 className="text-lg text-bold">Payment</h3>
                                        </div>
                                        <div className="flex gap-2 h-[56px]">
                                            <div className="flex flex-col h-[84px] w-[130px] gap-1">
                                                <h3 className="text-lg">{moneyFormatter.format(order.amount_total)}</h3>
                                                <h3 className="text-lg">Order Status</h3>
                                                {refund_status && <h3 className="text-lg">Refund Status</h3>}
                                            </div>
                                            <div className="flex flex-col items-center h-[84px] gap-2">
                                                <PaymentStatusMap status={order.payment_status} />
                                                <OrderStatusMap status={order.order_status} />
                                                {refund_status && <RefundStatusMap status={refund_status} />}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 border-r-kai-grey border-r-2 px-8">
                                        <div className="flex gap-2 h-[28px]">
                                            <UserRoundSearch/>
                                            <h3 className="text-lg text-bold">Customer</h3>
                                        </div>
                                        <h3 className="flex h-fit items-center">{order.customer?.name ?? order.user?.name}</h3>
                                        <h3 className="flex h-fit items-center">{order.customer?.email ?? order.user?.email}</h3>
                                    </div>
                                    <div className="flex flex-col gap-2 border-r-kai-grey border-r-2 px-8">
                                        <div className="flex gap-2 h-[28px]">
                                            <Truck/>
                                            <h3 className="text-lg text-bold">Shipping</h3>
                                        </div>
                                        <h3 className="flex h-fit items-center">{order.address.line1}, {displayNames.of(order.address.country!)}, {order.address.postal_code}</h3>
                                        {
                                            order.order_status === "shipped" && (
                                                <h3 className="flex h-fit items-center">{order.shipping_provider} - {order.tracking_number}</h3>
                                            )
                                        }
                                    </div>
                                    <div className="flex flex-col gap-2 border-r-kai-grey border-r-2 px-8">
                                        <div className="flex gap-2 h-[28px]">
                                            <FilePenLine/>
                                            <h3 className="text-lg text-bold">Actions</h3>
                                        </div>
                                        <div className="grid grid-rows-2 grid-cols-2 gap-2">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant={'secondary'} className="flex justify-between">
                                                        <span>
                                                            Update status
                                                        </span>
                                                        <ChevronDown width={16} height={16}/>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-kai-white">
                                                    <ChangeOrderStatusComponent
                                                        data={order}
                                                        revalidate={async () => {
                                                            setOrder(validateOrder(await getOrderWithProducts(order_id)))
                                                            const res = await getRefundStatus(order.refund_id ?? undefined)
                                                            if (res === "error") return;
                                                            setRefundStatus(res)
                                                        }}
                                                        order_id={order_id}
                                                        setCancelOrderDialogOpen={setCancelOrderDialogOpen}
                                                        setShippingDialogOpen={setShippingDialogOpen}
                                                        cancel_disabled={true}
                                                    />
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                            <Button className="flex justify-between" onClick={() => {
                                                const stripeUrl = `https://dashboard.stripe.com${process.env.NODE_ENV === "development" ? "/test" : ""}/invoices/${order.invoice_id}`;
                                                window.open(stripeUrl, '_blank');
                                            }}>
                                                <span>
                                                    View invoice
                                                </span>
                                                <ExternalLink width={16} height={16}/>
                                            </Button>
                                            <Button className="flex justify-between" onClick={() => {
                                                const stripeUrl = `https://dashboard.stripe.com${process.env.NODE_ENV === "development" ? "/test" : ""}/payments/${order.payment_id}`;
                                                window.open(stripeUrl, '_blank');
                                            }}>
                                                <span>
                                                    View payment
                                                </span>
                                                <ExternalLink width={16} height={16}/>
                                            </Button>
                                            <Button variant={"destructive"} onClick={() => setCancelOrderDialogOpen(true)}>Cancel and Refund</Button>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <h3 className="text-lg text-bold">Order Summary</h3>
                                    <OrderComponent data={order.items} />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <FooterComponent />
                <ChangeOrderStatusDialogs
                    cancelOrderDialogOpen={cancelOrderDialogOpen}
                    setCancelOrderDialogOpen={setCancelOrderDialogOpen}
                    shippingDialogOpen={shippingDialogOpen}
                    setShippingDialogOpen={setShippingDialogOpen}
                    order_id={order_id}
                    payment_id={order.payment_id}
                    revalidate={async () => {
                        setOrder(validateOrder(await getOrderWithProducts(order_id)))
                        const res = await getRefundStatus(order.refund_id ?? undefined)
                        if (res === "error") return;
                        setRefundStatus(res)
                    }}
                />
            </div>
        </main>
    )
}

export default OrderPage