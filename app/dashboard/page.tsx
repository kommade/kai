import React, { Suspense } from 'react'
import DashboardPage from "./page-client"
import { ifLoggedInGetUser } from "@/functions/auth";
import { getAllOrders } from "@/functions/database";
import LoadingComponent from "@/components/LoadingComponent";
import { getDisputes, getBalance } from "@/functions/stripe";

const DashboardPageWrapper = async () => {
    const orders = await getAllOrders();
    const stripe = {
        disputes: await getDisputes(),
        balance: await getBalance()
    }
    return (
        <Suspense fallback={<LoadingComponent/>}>
            <DashboardPage data={orders} stripe={stripe} />
        </Suspense>
    )
}

export default DashboardPageWrapper