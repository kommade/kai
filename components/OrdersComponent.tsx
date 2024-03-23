"use client";

import Kai, { Expand } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import React from 'react'
import { Button } from "./ui/button";
import { DataTable } from "./DataTable";
import { useRouter } from "next/navigation";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuPortal, DropdownMenuSubContent } from "./ui/dropdown-menu";
import Stripe from "stripe";
import { getOrders } from "@/functions/database";
import { useToast } from "./ui/use-toast";
import { ChangeOrderStatusComponent, ChangeOrderStatusDialogs, OrderStatusMap, PaymentStatusMap } from "./StatusMaps";

const OrdersComponent = ({ data }: { data: Kai.Orders | undefined }) => {
    const {toast} = useToast();
    const router = useRouter();
    const [orders, setOrders] = React.useState<Kai.Orders>(data || {});
    const [cancelOrderDialogOpen, setCancelOrderDialogOpen] = React.useState(false);
    const [shippingDialogOpen, setShippingDialogOpen] = React.useState(false);
    
    

    const columns: ColumnDef<Expand<Kai.Order & { orderId: string }>>[] = [
        {
            accessorKey: "orderId",
            header: "Order ID",
            cell: ({ row }) => {
                const id = row.getValue("orderId") as string;
                return (
                    <span className="text-kai-blue">{id.split('order:')[1]}</span>
                )
            }
        },
        {
            accessorKey: "customer_name",
            header: "Name",
        },
        {
            accessorKey: "customer_email",
            header: "Email",
        },
        {
            accessorKey: "address",
            header: "Delivery Address",
            cell: ({ row }) => {
                const address = row.getValue("address") as Stripe.Address;
                const displayNames = new Intl.DisplayNames(['en'], {type: 'region'});
                return (
                    <span>{address.line1}, {displayNames.of(address.country!)}, {address.postal_code}</span>
                )
            }
        },
        {
            accessorKey: "amount_total",
            header: "Amount payable",
            cell: ({ row }) => {
                const price = row.getValue("amount_total") as number / 100;
                const formatted = new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "SGD",
                }).format(price);
                return formatted;
            },
            
        },
        {
            accessorKey: "payment_status",
            header: "Payment status",
            cell: ({ row }) => {
                const status = row.getValue("payment_status") as string;
                return <PaymentStatusMap status={status} />
            }
        },
        {
            accessorKey: "order_status",
            header: ({ column }) => {
                    return (
                    <Button
                        variant="ghost"
                            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                            className="p-2"
                    >
                        Order status
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                    )
                },
            cell: ({ row }) => {
                const status = row.getValue("order_status") as Kai.Order['order_status'];
                return (
                    <div className="w-[110px]">
                        <OrderStatusMap status={status}/>
                    </div>
                );
            }
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const order_id = row.getValue("orderId") as string;
                const payment_id = row.original.payment_id;
                return (
                    <>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-kai-white">
                                <DropdownMenuItem onClick={() => router.push(`/dashboard/orders/${order_id.split('order:')[1]}`)}>View order</DropdownMenuItem>
                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>
                                        <span>Update order status</span>
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuPortal>
                                        <DropdownMenuSubContent className="bg-kai-white">
                                            <ChangeOrderStatusComponent
                                                data={row.original}
                                                revalidate={async () => setOrders(await getOrders())}
                                                order_id={order_id}
                                                setCancelOrderDialogOpen={setCancelOrderDialogOpen}
                                                setShippingDialogOpen={setShippingDialogOpen}
                                            />
                                        </DropdownMenuSubContent>
                                    </DropdownMenuPortal>
                                </DropdownMenuSub>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => {
                                        const stripeUrl = `https://dashboard.stripe.com${process.env.NODE_ENV === "development" ? "/test" : ""}/payments/${payment_id}`;
                                        window.open(stripeUrl, '_blank');
                                    }}
                                >
                                    View payment details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => {
                                        navigator.clipboard.writeText(order_id)
                                        toast({ description: "Copied to clipboard!", duration: 1000, variant: "success" })
                                    }}
                                >
                                Copy order ID
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <ChangeOrderStatusDialogs
                            cancelOrderDialogOpen={cancelOrderDialogOpen}
                            setCancelOrderDialogOpen={setCancelOrderDialogOpen}
                            shippingDialogOpen={shippingDialogOpen}
                            setShippingDialogOpen={setShippingDialogOpen}
                            order_id={order_id}
                            payment_id={payment_id}
                            revalidate={async () => setOrders(await getOrders())}
                        />
                    </>
                )
            }
        }
    ];
    
    return (
        <>
            <DataTable columns={columns} data={Object.entries(orders).map(([orderId, order]) => ({ ...order, orderId }))} />
        </>
    );
}

export default React.memo(OrdersComponent)