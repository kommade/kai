import React, { Suspense } from 'react'
import CheckoutPage from "./page-client"
import { getSessionId, sessionIsActive, sessionIsExpired } from "@/functions/sessions"
import { getCart, getCartTotal } from "@/functions/database";
import Kai from "@/lib/types";
import { createCheckoutSession } from "@/functions/stripe";
import MessageComponent from "@/components/MessageComponent";
import { ifLoggedInGetUser } from "@/functions/auth";

const CheckoutPageWrapper = async () => {
    const sessionActive = await sessionIsActive();
    const sessionExpired = await sessionIsExpired();
    const auth = await ifLoggedInGetUser();
    let total: number = 0;
    let session_id: string | undefined;
    let cart: undefined | Kai.Cart;
    if (sessionActive && !sessionExpired) {
        session_id = await getSessionId();
        cart = await getCart() as Kai.Cart;
        total = await getCartTotal();
    }
    let checkoutSession = "";
    if (cart) {
        checkoutSession = await createCheckoutSession(cart, auth.loggedIn ? auth.user : undefined);
    }
    return (
        <Suspense fallback={<MessageComponent message="Loading..."/>}>
            <CheckoutPage data={{checkoutSession, total}} expired={sessionExpired} />
        </Suspense>
    )
}

export default CheckoutPageWrapper