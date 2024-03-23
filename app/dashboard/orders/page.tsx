import React, { Suspense } from 'react'
import OrdersPage from "./page-client"
import LoadingComponent from "@/components/LoadingComponent";
import { ifLoggedInGetUser } from "@/functions/auth";
import { getOrders } from "@/functions/database";

const OrdersPageWrapper = async () => {
    const auth = await ifLoggedInGetUser();
    const orders = await getOrders();
    return (
        <Suspense fallback={<LoadingComponent/>}>
            <OrdersPage auth={auth} data={orders} />
        </Suspense>
    )
}

export default OrdersPageWrapper