"use client";

import FooterComponent from "@/components/FooterComponent"
import HeaderComponent from "@/components/HeaderComponent"
import { getCart, getProducts } from "@/functions/database";
import { getSessionIdAndCreateIfMissing } from "@/functions/sessions";
import { ProductData } from "@/lib/types"
import React, { useEffect } from 'react'

const CartPage = () => {
    const [products, setProducts] = React.useState<ProductData[]>([]);
    useEffect(() => {
        const fetchCart = async () => {
            const session = await getSessionIdAndCreateIfMissing();
            const cart = await getCart(session);
            const productsInCart = (await getProducts(cart)).data!;
            setProducts(productsInCart);
        }
        fetchCart();
    }, [])
    return (
        <main className="flex min-h-screen flex-col items-center justify-between">
            <div className="w-full h-fit min-h-[100vh] min-w-[1024px] relative flex flex-col">
                <HeaderComponent/>
                <section className="mt-[80px] min-h-[calc(100vh_-_140px)] w-full h-fit flex flex-col justify-start items-center py-6">
                    <div className="w-[90%] justify-between flex">
                        <h2 className="text-center w-fit text-[24px]">CART</h2>
                        <div className="flex w-[250px]">
                            {products.map((product) => product.name)}
                        </div>
                    </div>
                </section>
                <FooterComponent/>
            </div>
        </main>
    )
}

export default CartPage