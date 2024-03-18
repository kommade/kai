import React, { Suspense } from 'react'
import OrdersPage from "./page-client"
import MessageComponent from "@/components/MessageComponent";
import { ifLoggedInGetUser } from "@/functions/auth";
import { getOrders } from "@/functions/database";

const OrdersPageWrapper = async () => {
    const auth = await ifLoggedInGetUser();
    const orders = await getOrders();
    return (
        <Suspense fallback={<MessageComponent message="Loading..."/>}>
            <OrdersPage auth={auth} data={orders} />
        </Suspense>
    )
}

export default OrdersPageWrapper