"use client";

import FooterComponent from "@/components/FooterComponent";
import HeaderComponent from "@/components/HeaderComponent";
import { Button } from "@/components/ui/button";
import { Elements, PaymentElement } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from 'react'

const stripePromise = loadStripe("pk_test_51Ort11GiBtQvXAdHTiJIvVBgrzl42qy3q1Pz3pq0Onf5ByR84KwlHBhxgu3Nz1trs4osvbuqPwOVrAGB2JDcxYoQ00g91le2Np");

const CheckoutPage = ({ data, expired, cartEmpty }: { data: { total?: number }, expired: boolean, cartEmpty: boolean }) => {
    const router = useRouter();
    const [clientSecret, setClientSecret] = useState('');
    if (expired) {
        router.push("/cart");
        return;
    }
    if (cartEmpty) {
        router.push("/cart?empty=true");
        return;
    }

    useEffect(() => {

    }, []);

    const shipping = 1.50;
    const orderAmount = data.total || 0;
    const discount = 0.05;
    return (
        <main className="flex flex-col items-center justify-between min-h-screen">
            <div className="w-full h-fit min-h-[100vh] min-w-[1024px] relative flex flex-col">
                <HeaderComponent/>
                <section className="mt-[80px] min-h-[calc(100vh_-_140px)] w-full h-fit flex flex-col justify-start items-center py-6">
                    <div className="w-[90%] justify-between flex flex-col">
                        <h2 className="text-center w-fit text-[24px]">CHECKOUT</h2>
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-row gap-2">
                                <div className="flex flex-col text-left">
                                    <h3 className="text-base">Order amount: </h3>
                                    <h3 className="text-base">Shipping: </h3>
                                    { discount > 0 && <h3 className="text-base">Discount: </h3>}
                                    <h3 className="text-base">Total: </h3>
                                </div>
                                <div className="flex flex-col text-left">
                                    <div className="h-[24px] flex items-center">
                                        <h3 className="text-sm">{new Intl.NumberFormat("en-US", {
                                            style: "currency",
                                            currency: "SGD",
                                        }).format(orderAmount)}</h3>
                                    </div>
                                    <div className="h-[24px] flex items-center">
                                        <h3 className="text-sm">{new Intl.NumberFormat("en-US", {
                                            style: "currency",
                                            currency: "SGD",
                                        }).format(shipping)}</h3>
                                    </div>
                                    { discount > 0 && <div className="h-[24px] flex items-center">
                                        <h3 className="text-sm">{new Intl.NumberFormat("en-US", {
                                            style: "currency",
                                            currency: "SGD",
                                        }).format(discount * (shipping + orderAmount))}</h3>
                                    </div>}
                                    <div className="h-[24px] flex items-center">
                                        <h3 className="text-sm">{new Intl.NumberFormat("en-US", {
                                            style: "currency",
                                            currency: "SGD",
                                        }).format((orderAmount + shipping) * (1 - discount))}</h3>
                                    </div>
                                </div>
                            </div>
                            <Elements stripe={stripePromise} options={{ clientSecret: ""}}>
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