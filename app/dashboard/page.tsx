import React, { Suspense } from 'react'
import DashboardPage from "./page-client"
import MessageComponent from "@/components/MessageComponent";
import { ifLoggedInGetUser } from "@/functions/auth";
import { getOrders } from "@/functions/database";

const CartPageWrapper = async () => {
    const auth = await ifLoggedInGetUser();
    const orders = await getOrders();
    return (
        <Suspense fallback={<MessageComponent message="Loading..."/>}>
            <DashboardPage auth={auth} data={orders} />
        </Suspense>
    )
}

export default CartPageWrapper