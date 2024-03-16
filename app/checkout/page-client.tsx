"use client";

import FooterComponent from "@/components/FooterComponent";
import HeaderComponent from "@/components/HeaderComponent";
import { Button } from "@/components/ui/button";
import { Elements, PaymentElement } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useRouter } from "next/navigation";
import React from 'react'

const stripePromise = loadStripe(process.env.STRIPE_PUBLIC_KEY as string);
const options = { clientSecret: process.env.STRIPE_PRIVATE_KEY as string };

const CheckoutPage = ({ data, expired, cartEmpty }: { data?: number, expired: boolean, cartEmpty: boolean }) => {
    const router = useRouter();
    if (expired) {
        router.push("/cart");
        return;
    }
    if (cartEmpty) {
        router.push("/cart?empty=true");
        return;
    }
    return (
        <main className="flex flex-col items-center justify-between min-h-screen">
            <div className="w-full h-fit min-h-[100vh] min-w-[1024px] relative flex flex-col">
                <HeaderComponent/>
                <section className="mt-[80px] min-h-[calc(100vh_-_140px)] w-full h-fit flex flex-col justify-start items-center py-6">
                    <div className="w-[90%] justify-between flex flex-col">
                        <h2 className="text-center w-fit text-[24px]">CHECKOUT</h2>
                        <div className="flex flex-col gap-4">
                            <h3 className="text-lg text-center w-fit">Total: ${data}</h3>
                            <Elements stripe={stripePromise} options={options}>
                                <form>
                                    <PaymentElement />
                                    <Button className="w-[100px]" variant={"default"}>Pay</Button>
                                </form>
                            </Elements>
                        </div>
                    </div>
                </section>
                <FooterComponent />
            </div>
        </main>
    )
}

export default CheckoutPage