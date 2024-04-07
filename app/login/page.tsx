import React, { Suspense } from 'react'
import LoginPage from "./page-client"
import LoadingComponent from "@/components/LoadingComponent";
import { getSessionId, getSessionIdOrNew } from "@/functions/sessions";

const CartPageWrapper = async () => {
    const session_id = await getSessionId();
    return (
        <Suspense fallback={<LoadingComponent/>}>
            <LoginPage session={session_id} />
        </Suspense>
    )
}

export default CartPageWrapper