import React, { Suspense } from 'react'
import ReturnPage from "./page-client"
import MessageComponent from "@/components/MessageComponent"
import { getCheckoutSession } from "@/functions/stripe"
import Kai from "@/lib/types"
import LoadingComponent from "@/components/LoadingComponent"

const ReturnPageWrapper = async ({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined }
    }
) => {
    const session_id = searchParams.session_id as string | undefined;
    let checkoutSession: undefined | Kai.CheckoutSession;
    if (session_id) {
        checkoutSession = await getCheckoutSession(session_id);
    }
    return (
        <Suspense fallback={<LoadingComponent/>}>
            <ReturnPage session={checkoutSession} />
        </Suspense>
    )
}

export default ReturnPageWrapper