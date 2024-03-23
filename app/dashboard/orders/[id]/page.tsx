import React from 'react'
import OrderPage from "./page-client"
import { changeOrderStatus, getOrder } from "@/functions/database";
import LoadingComponent from "@/components/LoadingComponent";
import { getRefundStatus } from "@/functions/stripe";

const OrderPageWrapper = async ({ params }: { params: { id: string } }) => {
    const order = await getOrder(`order:${params.id}`);
    if (order === null) {
        return <MessageComponent message="Order not found"/>
    }
    let refund_status: "pending" | "requires_action" | "succeeded" | "failed" | "cancelled" | undefined = undefined;
    if (order.order_status === "cancelled") {
        const res = await getRefundStatus(order.refund_id!);
        if (res === "error") {
            refund_status = "pending";
        } else {
            refund_status = res;
            if (res === "succeeded") {
                await changeOrderStatus(`order:${params.id}`, "refunded");
            }
        }
    }
    return (
        <OrderPage data={order} order_id={`order:${params.id}`} refund={refund_status} />
    )
}

export default OrderPageWrapper