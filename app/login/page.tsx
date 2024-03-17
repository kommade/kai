import React, { Suspense } from 'react'
import LoginPage from "./page-client"
import MessageComponent from "@/components/MessageComponent";

const CartPageWrapper = async () => {
    return (
        <Suspense fallback={<MessageComponent message="Loading..."/>}>
            <LoginPage />
        </Suspense>
    )
}

export default CartPageWrapper