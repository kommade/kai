import React, { Suspense } from 'react'
import CartPage from "./page-client"
import { getSessionId, sessionIsActive, sessionIsExpired } from "@/functions/sessions"
import { getCart } from "@/functions/database";
import Kai from "@/lib/types";
import LoadingComponent from "@/components/LoadingComponent";

const CartPageWrapper = async () => {
    const sessionActive = await sessionIsActive();
    const sessionExpired = await sessionIsExpired();
    let cart: Kai.Cart | undefined;
    if (sessionActive && !sessionExpired) {
        const session = await getSessionId();
        cart = (await getCart(session!))!;
    }
    return (
        <Suspense fallback={<LoadingComponent/>}>
            <CartPage data={cart} expired={sessionExpired} />
        </Suspense>
    )
}

export default CartPageWrapper