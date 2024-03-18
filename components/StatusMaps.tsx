import React from 'react';
import { PackageSearch, PackageIcon, PackageCheck, PackageX, RotateCcw, AlertCircle, Ban, CircleEllipsis } from "lucide-react"; 
import { Check, XIcon } from "lucide-react";
import Kai from "@/lib/types";
import { DropdownMenuItem } from "./ui/dropdown-menu";
import { cancelOrder, changeOrderStatus, setShippingDetails } from "@/functions/database";
import { shippingFormSchema } from "@/lib/zod";
import { z } from "zod";
import { useToast } from "./ui/use-toast";
import { AlertDialogComponent } from "./AlertDialogComponent";
import { InputShippingDetailsComponent } from "./InputShippingDetailsComponent";
import { refundPayment } from "@/functions/stripe";

export const orderStatusMap = {
    "pending": <span className="flex gap-2 w-full  justify-between rounded-md p-1 px-2 bg-kai-yellow/30"><h3 className="h-[16.67px] text-kai-yellow ">Pending</h3> <PackageSearch className="stroke-kai-yellow mx-1" width={16.67} height={16.67}/></span>,
    "shipped": <span className="flex gap-2 w-full  justify-between rounded-md p-1 px-2  bg-kai-blue/30"><h3 className="h-[16.67px] text-kai-blue">Shipped</h3> <PackageIcon className="stroke-kai-blue mx-1" width={16.67} height={16.67}/></span>,
    "delivered": <span className="flex gap-2 w-full  justify-between rounded-md p-1 px-2  bg-kai-green/30"><h3 className="h-[16.67px] text-kai-green ">Delivered</h3> <PackageCheck className="stroke-kai-green mx-1" width={16.67} height={16.67}/></span>,
    "cancelled": <span className="flex gap-2 w-full  justify-between rounded-md p-1 px-2  bg-kai-red/30"><h3 className="h-[16.67px] text-kai-red ">Cancelled</h3> <PackageX className="stroke-kai-red mx-1" width={16.67} height={16.67} /></span>,
    "refunded": <span className="flex gap-2 w-full  justify-between rounded-md p-1 px-2  bg-kai-red/30"><h3 className="h-[16.67px] text-kai-red ">Refunded</h3> <RotateCcw className="stroke-kai-red mx-1" width={16.67} height={16.67} /></span>
};

interface OrderStatusMapProps {
    status: keyof typeof orderStatusMap;
}

export const OrderStatusMap: React.FC<OrderStatusMapProps> = ({ status }) => {
    return orderStatusMap[status] || null;
};


interface PaymentStatusProps {
    status: string;
}

export const PaymentStatusMap: React.FC<PaymentStatusProps> = ({ status }) => {
    if (status === "paid") {
        return (
            <span className="flex gap-2 w-full rounded-md p-1 px-3 bg-kai-green/30 justify-between"><h3 className="h-[16.67px] text-kai-green">Paid</h3> <Check className="stroke-kai-green" width={16.67} height={16.67}/></span>
        )
    } else {
        return (
            <span className="flex gap-2 w-full rounded-md p-1 px-3 bg-kai-red/30 justify-between"><h3 className="h-[16.67px] text-kai-red">Unpaid</h3> <XIcon className="stroke-kai-red" width={16.67} height={16.67}/></span>
        )
    }
};

export const ChangeOrderStatusComponent = ({
    data,
    order_id,
    revalidate,
    setCancelOrderDialogOpen,
    setShippingDialogOpen,
    cancel_disabled = false
}: {
        data: Kai.Order,
        order_id: string,
        revalidate: () => void,
        setCancelOrderDialogOpen: (open: boolean) => void,
        setShippingDialogOpen: (open: boolean) => void,
        cancel_disabled?: boolean
    }
) => {
    const { toast } = useToast();
    const changeStatus = async (id: string, status: Kai.Order['order_status']) => {
        const res = await changeOrderStatus(id, status);
        if (res.success) {
            toast({ description: "Order status updated", duration: 1000, variant: "success" })
            revalidate();
        } else {
            toast({ description: "Error updating order status", duration: 1000, variant: "destructive" })
        }
    }

    return (
        <>
            {
                data.order_status === "cancelled" ? <span className="flex gap-2 w-full justify-between rounded-md p-1 px-2 bg-kai-red/30"><h3 className="h-[16.67px] text-kai-red ">Action not allowed</h3> <XIcon className="stroke-kai-red mx-1" width={16.67} height={16.67} /></span> :
                Object.entries(orderStatusMap).map(([status, display]) => {
                    if (status === data.order_status || (status === "cancelled" && cancel_disabled) || status === "refunded") return <React.Fragment key={status}></React.Fragment>;
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
        </>
    )
}

export const ChangeOrderStatusDialogs = ({
    cancelOrderDialogOpen,
    setCancelOrderDialogOpen,
    shippingDialogOpen,
    setShippingDialogOpen,
    order_id,
    payment_id,
    revalidate
}: {
    cancelOrderDialogOpen: boolean,
    setCancelOrderDialogOpen: (open: boolean) => void,
    shippingDialogOpen: boolean,
    setShippingDialogOpen: (open: boolean) => void,
    order_id: string,
    payment_id: string,
    revalidate: () => void
}) => {
    const { toast } = useToast();
    const handleCancelOrder = async (order_id: string, payment_id: string) => {
        const refund = await refundPayment(payment_id);
        if (refund === "error") {
            toast({ description: "Error refunding payment", duration: 2000, variant: "destructive" })
            return;
        }
        const res = await cancelOrder(order_id, refund.id, refund.status!);
        if (res.success) {
            toast({ description: "Order cancelled successfully", duration: 2000, variant: "success" })
            revalidate();
        } else {
            toast({ description: "Failed to cancel order", duration: 2000, variant: "destructive" })
        }
    }
    
    const handleSetShippingDetails = async (data: z.infer<typeof shippingFormSchema>, order_id: string) => {
        const res = await setShippingDetails(order_id, data);
        if (res.success) {
            toast({ description: "Shipping details added", duration: 1000, variant: "success" });
            revalidate();
        } else {
            toast({ description: "Error adding shipping details", duration: 1000, variant: "destructive"});
        }
    }
    return (
        <>
            <AlertDialogComponent
                headerText="Are you sure?"
                descriptionText="This will cancel the order and send an email informing the customer of the cancellation (WIP). This cannot be undone."
                close={() => setCancelOrderDialogOpen(false)}
                action={async () => {
                    setCancelOrderDialogOpen(false)
                    await handleCancelOrder(order_id, payment_id)
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

export const refundStatusMap = {
    "pending": <span className="flex gap-2 w-full  justify-between rounded-md p-1 px-2 bg-kai-yellow/30"><h3 className="h-[16.67px] text-kai-yellow ">Pending</h3> <CircleEllipsis className="stroke-kai-yellow mx-1" width={16.67} height={16.67}/></span>,
    "requires_action": <span className="flex gap-2 w-full  justify-between rounded-md p-1 px-2  bg-kai-blue/30"><h3 className="h-[16.67px] text-kai-blue">Action needed</h3> <AlertCircle className="stroke-kai-blue mx-1" width={16.67} height={16.67}/></span>,
    "succeeded": <span className="flex gap-2 w-full  justify-between rounded-md p-1 px-2  bg-kai-green/30"><h3 className="h-[16.67px] text-kai-green ">Succeeded</h3> <Check className="stroke-kai-green mx-1" width={16.67} height={16.67}/></span>,
    "failed": <span className="flex gap-2 w-full  justify-between rounded-md p-1 px-2  bg-kai-red/30"><h3 className="h-[16.67px] text-kai-red ">Failed</h3> <XIcon className="stroke-kai-red mx-1" width={16.67} height={16.67} /></span>,
    "cancelled": <span className="flex gap-2 w-full  justify-between rounded-md p-1 px-2  bg-kai-red/30"><h3 className="h-[16.67px] text-kai-red ">Cancelled</h3> <Ban className="stroke-kai-red mx-1" width={16.67} height={16.67} /></span>
};

interface RefundStatusMapProps {
    status: keyof typeof refundStatusMap;
}

export const RefundStatusMap: React.FC<RefundStatusMapProps> = ({ status }) => {
    return refundStatusMap[status] || null;
};