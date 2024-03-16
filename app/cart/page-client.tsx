"use client";

import CartComponent from "@/components/CartComponent";
import FooterComponent from "@/components/FooterComponent"
import HeaderComponent from "@/components/HeaderComponent"
import { useToast } from "@/components/ui/use-toast";
import Kai from "@/lib/types"

import React, { useEffect } from 'react'

const CartPage = ({ data, expired }: { data?: Kai.Cart, expired: boolean }) => {
    const { toast } = useToast();
    useEffect(() => {
        if (expired) {
            toast(
                {
                    description: "Your session has expired. Please add the items you wish to purchase to the cart again.",
                    variant: "destructive",
                    duration: 3000
                }
            );
        }
    }, []);    

    return (
        <main className="flex flex-col items-center justify-between min-h-screen">
            <div className="w-full h-fit min-h-[100vh] min-w-[1024px] relative flex flex-col">
                <HeaderComponent/>
                <section className="mt-[80px] min-h-[calc(100vh_-_140px)] w-full h-fit flex flex-col justify-start items-center py-6">
                    <div className="w-[90%] justify-between flex flex-col">
                        <h2 className="text-center w-fit text-[24px]">CART</h2>
                        <CartComponent data={data} />
                    </div>
                </section>
                <FooterComponent />
            </div>
        </main>
    )
}

export default CartPage