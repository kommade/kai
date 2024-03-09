import React, { Suspense } from 'react'
import CartPage from "./page-client"

const CartPageWrapper = async () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CartPage/>
        </Suspense>
    )
}

export default CartPageWrapper