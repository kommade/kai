import React, { Suspense } from 'react'
import LoginPage from "./page-client"
import MessageComponent from "@/components/MessageComponent";
import { sessionIsActive, sessionIsExpired, getSessionId } from "@/functions/sessions";

const CartPageWrapper = async () => {
    const sessionActive = await sessionIsActive();
    const sessionExpired = await sessionIsExpired();
    let session: string | undefined;
    if (sessionActive && !sessionExpired) {
        session = await getSessionId();
    }
    return (
        <Suspense fallback={<MessageComponent message="Loading..."/>}>
            <LoginPage session={session} />
        </Suspense>
    )
}

export default CartPageWrapper