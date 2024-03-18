"use client";

import Kai, { Expand } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Check, MoreHorizontal, PackageCheck, PackageIcon, PackageSearch, PackageX, XIcon } from "lucide-react";
import React from 'react'
import { Button } from "./ui/button";
import { DataTable } from "./DataTable";
import { useRouter } from "next/navigation";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuPortal, DropdownMenuSubContent } from "./ui/dropdown-menu";
import Stripe from "stripe";
import { AlertDialogComponent } from "./AlertDialogComponent";
import { cancelOrder, changeOrderStatus, getOrders, setShippingDetails } from "@/functions/database";
import { useToast } from "./ui/use-toast";
import { InputShippingDetailsComponent } from "./InputShippingDetailsComponent";
import { z } from "zod";
import { shippingFormSchema } from "@/lib/zod";

const OrdersComponent = ({ data }: { data: Kai.Orders | undefined }) => {
    const {toast} = useToast();
    const router = useRouter();
    const [orders, setOrders] = React.useState<Kai.Orders>(data || {});
    const [cancelOrderDialogOpen, setCancelOrderDialogOpen] = React.useState(false);
    const [shippingDialogOpen, setShippingDialogOpen] = React.useState(false);
    
    const statusMap = {
        "pending": <span className="flex gap-2 w-full  justify-between rounded-md p-1 px-2 bg-kai-yellow/30"><h3 className="h-[16.67px] text-kai-yellow ">Pending</h3> <PackageSearch className="stroke-kai-yellow mx-1" width={16.67} height={16.67}/></span>,
        "shipped": <span className="flex gap-2 w-full  justify-between rounded-md p-1 px-2  bg-kai-blue/30"><h3 className="h-[16.67px] text-kai-blue">Shipped</h3> <PackageIcon className="stroke-kai-blue mx-1" width={16.67} height={16.67}/></span>,
        "delivered": <span className="flex gap-2 w-full  justify-between rounded-md p-1 px-2  bg-kai-green/30"><h3 className="h-[16.67px] text-kai-green ">Delivered</h3> <PackageCheck className="stroke-kai-green mx-1" width={16.67} height={16.67}/></span>        ,
        "cancelled": <span className="flex gap-2 w-full  justify-between rounded-md p-1 px-2  bg-kai-red/30"><h3 className="h-[16.67px] text-kai-red ">Cancelled</h3> <PackageX className="stroke-kai-red mx-1" width={16.67} height={16.67}/></span>

    }

    const handleCancelOrder = async (id: string) => {
        const res = await cancelOrder(id);
        if (res.success) {
            toast({ description: "Order cancelled successfully", duration: 2000, variant: "success" })
            setOrders(await getOrders());
        } else {
            toast({ description: "Failed to cancel order", duration: 2000, variant: "destructive" })
        }
    }

    const changeStatus = async (id: string, status: Kai.Order['order_status']) => {
        const res = await changeOrderStatus(id, status);
        if (res.success) {
            toast({ description: "Order status updated", duration: 1000, variant: "success" })
            setOrders(await getOrders());
        } else {
            toast({ description: "Error updating order status", duration: 1000, variant: "destructive" })
        }
    }

    const handleSetShippingDetails = async (data: z.infer<typeof shippingFormSchema>, order_id: string) => {
        const res = await setShippingDetails(order_id, data);
        if (res.success) {
            toast({ description: "Shipping details added", duration: 1000, variant: "success" });
            setOrders(await getOrders());
        } else {
            toast({ description: "Error adding shipping details", duration: 1000, variant: "destructive"});
        }
    }

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
                if (status === "paid") {
                    return (
                        <span className="flex gap-2 w-fit rounded-md p-1 px-2 bg-kai-green/30"><h3 className="h-[16.67px] text-kai-green">Paid</h3> <Check className="stroke-kai-green" width={16.67} height={16.67}/></span>
                    )
                } else {
                    return (
                        <span className="flex gap-2 w-fit rounded-md p-1 px-2 bg-kai-red/30"><h3 className="h-[16.67px] text-kai-red">Unpaid</h3> <XIcon className="stroke-kai-red" width={16.67} height={16.67}/></span>
                    )
                
                }
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
                        {statusMap[status]}
                    </div>
                );
            }
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const order_id = row.getValue("orderId") as string;
                const order_status = row.getValue("order_status") as string;
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
                                <DropdownMenuItem>View order</DropdownMenuItem>
                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>
                                        <span>Update order status</span>
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuPortal>
                                        <DropdownMenuSubContent className="bg-kai-white">
                                            {
                                                order_status === "cancelled" ? <span className="flex gap-2 w-full justify-between rounded-md p-1 px-2 bg-kai-red/30"><h3 className="h-[16.67px] text-kai-red ">Action not allowed</h3> <XIcon className="stroke-kai-red mx-1" width={16.67} height={16.67}/></span> :
                                                Object.entries(statusMap).map(([status, display]) => {
                                                    if (status === order_status) return <React.Fragment key={status}></React.Fragment>;
                                                    let newDisplay: React.ReactElement;
                                                    if (status === "cancelled") {
                                                        newDisplay = Object.assign({}, display, { props: { ...display.props, onClick: () => setCancelOrderDialogOpen(true) } });
                                                    } else if (status === "shipped") {
                                                        newDisplay = Object.assign({}, display, { props: { ...display.props, onClick: () => setShippingDialogOpen(true) } });
                                                    } else {
                                                        newDisplay = Object.assign({}, display, { props: { ...display.props, onClick: () => changeStatus(order_id, status as "pending" | "shipped" | "delivered" | "cancelled")} });
                                                    }
                                                    return (
                                                        <DropdownMenuItem key={status}>
                                                            {newDisplay}
                                                        </DropdownMenuItem>
                                                    )
                                                })
                                            }
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
                        <AlertDialogComponent
                            headerText="Are you sure?"
                            descriptionText="This will cancel the order and send an email informing the customer of the cancellation (WIP). This cannot be undone."
                            close={() => setCancelOrderDialogOpen(false)}
                            action={async () => {
                                setCancelOrderDialogOpen(false)
                                await handleCancelOrder(order_id)
                            }}
                            open={cancelOrderDialogOpen}
                        />
                        <InputShippingDetailsComponent
                            open={shippingDialogOpen}
                            action={async (shippingDetails) => {
                                setShippingDialogOpen(false);
                                await handleSetShippingDetails(shippingDetails, order_id);
                            }}
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