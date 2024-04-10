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
import { getAllOrders } from "@/functions/database";
import { useToast } from "./ui/use-toast";
import { ChangeOrderStatusComponent, ChangeOrderStatusDialogs, OrderStatusMap, PaymentStatusMap } from "./StatusMaps";
import { zodValidateOrder } from "@/lib/zod";
import { z } from "zod";

const OrdersComponent = ({ data }: { data?: Kai.Order[] }) => {
    const {toast} = useToast();
    const router = useRouter();
    const [orders, setOrders] = React.useState<Kai.Order[]>(data || []);
    const [cancelOrderDialogOpen, setCancelOrderDialogOpen] = React.useState(false);
    const [shippingDialogOpen, setShippingDialogOpen] = React.useState(false);

    const columns: ColumnDef<Expand<Kai.Order>>[] = [
        {
            accessorKey: "order_id",
            header: "Order ID",
        },
        {
            header: "Name",
            cell: ({ row }) => <span className="text-kai-blue">{row.original.customer?.name ?? row.original.user?.name}</span>
        },
        {

            header: "Email",
            cell: ({ row }) => <span className="text-kai-blue">{row.original.customer?.email ?? row.original.user?.email}</span>
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
                const price = row.getValue("amount_total") as number;
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
                const status = row.getValue("order_status") as z.infer<typeof zodValidateOrder>['order_status'];
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
            cell: ({ row, table }) => {
                const order_id = row.getValue("order_id") as number;
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
                                <DropdownMenuItem onClick={() => router.push(`/dashboard/orders/${order_id}`)}>View order</DropdownMenuItem>
                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>
                                        <span>Update order status</span>
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuPortal>
                                        <DropdownMenuSubContent className="bg-kai-white">
                                            <ChangeOrderStatusComponent
                                                data={row.original}
                                                revalidate={async () => setOrders(await getAllOrders())}
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
                                        navigator.clipboard.writeText(order_id.toString());
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
                            revalidate={async () => setOrders(await getAllOrders())}
                        />
                    </>
                )
            }
        }
    ];
    
    return (
        <>
            <DataTable columns={columns} data={orders} />
        </>
    );
}

export default OrdersComponent