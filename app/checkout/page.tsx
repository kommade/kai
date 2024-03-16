import React, { Suspense } from 'react'
import CheckoutPage from "./page-client"
import { getSessionId, sessionIsActive, sessionIsExpired } from "@/functions/sessions"
import { getCart, getCartTotal, setCartTotal } from "@/functions/database";
import Kai from "@/lib/types";

const CheckoutPageWrapper = async () => {
    const sessionActive = await sessionIsActive();
    const sessionExpired = await sessionIsExpired();
    let total: number | undefined;
    let emptyCart = false;
    if (sessionActive && !sessionExpired) {
        const session = await getSessionId();
        total = await getCartTotal(session!);
        if (total === 0) {
            const cart = await getCart(session!) as Kai.Cart;
            if (cart.length != 0) {
                const cartTotal = cart.reduce((acc, curr) => acc + curr.total, 0);
                setCartTotal(session!, cartTotal);
                total = cartTotal;
            } else {
                emptyCart = true;
            }
        }
    }
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CheckoutPage data={total} expired={sessionExpired} cartEmpty={emptyCart} />
        </Suspense>
    )
}

export default CheckoutPageWrapper