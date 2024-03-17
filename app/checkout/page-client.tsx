"use client";

import FooterComponent from "@/components/FooterComponent";
import HeaderComponent from "@/components/HeaderComponent";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useRouter } from "next/navigation";
import React, { useEffect } from 'react'

const stripePromise = loadStripe("pk_test_51Ort11GiBtQvXAdHTiJIvVBgrzl42qy3q1Pz3pq0Onf5ByR84KwlHBhxgu3Nz1trs4osvbuqPwOVrAGB2JDcxYoQ00g91le2Np");

const CheckoutPage = ({ data, expired }:
{
    data: {
        checkoutSession: string,
        total: number
    },
    expired: boolean
    }
) => {
    useEffect(() => {
        const router = useRouter();
        if (expired || data.checkoutSession === "" || data.total === 0) {
            router.push("/cart?error=true");
        }
    }, [expired, data.checkoutSession, data.total]);
    return (
        <main className="flex flex-col items-center justify-between min-h-screen">
            <div className="w-full h-fit min-h-[100vh] min-w-[1024px] relative flex flex-col">
                <HeaderComponent/>
                <section className="mt-[80px] min-h-[calc(100vh_-_140px)] w-full h-fit flex flex-col justify-start items-center py-6">
                    <div className="w-[90%] justify-between flex flex-col">
                        <h2 className="text-center w-fit text-[24px]">CHECKOUT</h2>
                        <div className="flex flex-col gap-4">
                            <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret: data.checkoutSession}}>
                                <EmbeddedCheckout/>
                            </EmbeddedCheckoutProvider>
                        </div>
                    </div>
                </section>
                <FooterComponent />
            </div>
        </main>
    )
}

export default CheckoutPage