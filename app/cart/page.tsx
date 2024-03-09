import React, { Suspense } from 'react'
import CartPage from "./page-client"
import { getSessionId } from "@/functions/sessions"
import { getCart } from "@/functions/database";

const CartPageWrapper = async () => {
    const session = await getSessionId();
    let cart;
    if (session) {
        cart = await getCart(session);
    }
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CartPage data={cart}/>
        </Suspense>
    )
}

export default CartPageWrapper