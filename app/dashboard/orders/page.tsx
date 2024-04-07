import React, { Suspense } from 'react'
import OrdersPage from "./page-client"
import LoadingComponent from "@/components/LoadingComponent";
import { ifLoggedInGetUser } from "@/functions/auth";
import { getAllOrders, getNumberOfOrders } from "@/functions/database";

const OrdersPageWrapper = async () => {
    const auth = await ifLoggedInGetUser();
    const orders = await getAllOrders(1, 5);
    const n = await getNumberOfOrders();
    return (
        <Suspense fallback={<LoadingComponent/>}>
            <OrdersPage auth={auth} data={orders} n={n} />
        </Suspense>
    )
}

export default OrdersPageWrapper