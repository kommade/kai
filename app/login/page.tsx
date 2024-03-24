import React, { Suspense } from 'react'
import LoginPage from "./page-client"
import LoadingComponent from "@/components/LoadingComponent";
import { sessionIsActive, sessionIsExpired, getSessionId } from "@/functions/sessions";

const CartPageWrapper = async () => {
    const sessionActive = await sessionIsActive();
    const sessionExpired = await sessionIsExpired();
    let session: string | undefined;
    if (sessionActive && !sessionExpired) {
        session = await getSessionId();
    }
    return (
        <Suspense fallback={<LoadingComponent/>}>
            <LoginPage session={session} />
        </Suspense>
    )
}

export default CartPageWrapper