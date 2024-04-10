import React, { Suspense } from 'react'
import OrderPage from "./page-client"
import { changeOrderStatus, getOrder, getOrderWithProducts, getProductInCart, getUserFromId } from "@/functions/database";
import { getRefundStatus } from "@/functions/stripe";
import MessageComponent from "@/components/MessageComponent";
import LoadingComponent from "@/components/LoadingComponent";
import Kai from "@/lib/types";

const OrderPageWrapper = async ({ params }: { params: { id: string } }) => {
    try {
        parseInt(params.id);
    } catch {
        return <MessageComponent message="Invalid order ID"/>
    }

    const order_id = parseInt(params.id);
    const order = await getOrderWithProducts(order_id);
    if (order == null) {
        return <MessageComponent message="Error fetching order items"/>
    }

    let refund_status: "pending" | "requires_action" | "succeeded" | "failed" | "cancelled" | undefined = undefined;
    if (order.order_status === "cancelled") {
        const res = await getRefundStatus(order.refund_id!);
        if (res === "error") {
            refund_status = "pending";
        } else {
            refund_status = res;
            if (res === "succeeded") {
                await changeOrderStatus(order_id, "refunded");
            }
        }
    }

    if (order.user_id) {
        order.user = await getUserFromId(order.user_id)
    }

    return (
        <Suspense fallback={<LoadingComponent/>}>
            <OrderPage data={order} order_id={order_id} refund={refund_status} />
        </Suspense>
    )
}

export default OrderPageWrapper