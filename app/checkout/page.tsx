import React, { Suspense } from 'react'
import CheckoutPage from "./page-client"
import { getSessionId, sessionIsActive, sessionIsExpired } from "@/functions/sessions"
import { getCart, getCartTotal } from "@/functions/database";
import Kai from "@/lib/types";
import { createCheckoutSession } from "@/functions/stripe";
import MessageComponent from "@/components/MessageComponent";

const CheckoutPageWrapper = async () => {
    const sessionActive = await sessionIsActive();
    const sessionExpired = await sessionIsExpired();
    let total: number = 0;
    let session_id: string | undefined;
    let cart: undefined | Kai.Cart;
    if (sessionActive && !sessionExpired) {
        session_id = await getSessionId();
        cart = await getCart(session_id!) as Kai.Cart;
        total = await getCartTotal(session_id!);
    }
    let checkoutSession = "";
    if (cart) {
        checkoutSession = await createCheckoutSession(cart);
    }
    return (
        <Suspense fallback={<MessageComponent message="Loading..."/>}>
            <CheckoutPage data={{checkoutSession, total}} expired={sessionExpired} />
        </Suspense>
    )
}

export default CheckoutPageWrapper