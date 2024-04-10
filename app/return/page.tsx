import React, { Suspense } from 'react'
import ReturnPage from "./page-client"
import { getCheckoutSession } from "@/functions/stripe"
import Kai from "@/lib/types"
import LoadingComponent from "@/components/LoadingComponent"

const ReturnPageWrapper = async ({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined }
    }
) => {
    const checkoutSessionId = searchParams.session_id as string | undefined;
    let checkoutSession: undefined | Kai.CheckoutSession;
    if (checkoutSessionId) {
        checkoutSession = await getCheckoutSession(checkoutSessionId);
    }
    return (
        <Suspense fallback={<LoadingComponent/>}>
            <ReturnPage checkoutSession={checkoutSession} />
        </Suspense>
    )
}

export default ReturnPageWrapper