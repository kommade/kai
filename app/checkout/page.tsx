import React, { Suspense } from 'react'
import CheckoutPage from "./page-client"
import { getSessionIdOrNew } from "@/functions/sessions"
import { getSessionId } from "@/functions/sessions-edge";
import { getCart, getCartTotal, getCartWithProducts, updateCartTotal } from "@/functions/database";
import Kai from "@/lib/types";
import { createCheckoutSession } from "@/functions/stripe";
import LoadingComponent from "@/components/LoadingComponent";
import { ifLoggedInGetUser, isLoggedIn } from "@/functions/auth";

const CheckoutPageWrapper = async () => {
    const auth = await ifLoggedInGetUser();
    const loggedIn = await isLoggedIn();
    const session_id = await getSessionId();
    const cart = session_id ? await getCartWithProducts(session_id, loggedIn) : null;
    const checkoutSession = cart ? await createCheckoutSession(cart, auth.loggedIn ? auth.user : undefined): null;
    return (
        <Suspense fallback={<LoadingComponent/>}>
            <CheckoutPage data={{checkoutSession, total: cart?.total}} expired={session_id == null} />
        </Suspense>
    )
}

export default CheckoutPageWrapper