import React, { Suspense } from 'react'
import CartPage from "./page-client"
import { getSessionIdOrNew } from "@/functions/sessions"
import { getSessionId } from "@/functions/sessions-edge";
import { getCartWithProducts } from "@/functions/database";
import LoadingComponent from "@/components/LoadingComponent";
import { isLoggedIn } from "@/functions/auth";

const CartPageWrapper = async () => {
    const loggedIn = await isLoggedIn();
    const session_id = await getSessionId();
    const cart = session_id ? await getCartWithProducts(session_id, loggedIn) : null;
    return (
        <Suspense fallback={<LoadingComponent/>}>
            <CartPage data={cart} expired={session_id === null } loggedIn={loggedIn} />
        </Suspense>
    )
}

export default CartPageWrapper