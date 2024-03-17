"use server";

import Kai from "@/lib/types";
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY as string);

export const createCheckoutSession = async (cart: Kai.Cart) => {
    try {
        const checkoutSession = await stripe.checkout.sessions.create({
            ui_mode: 'embedded',
            payment_method_types: ['card', 'paynow'],
        });
    } catch (error) {
        console.error(error);
    }
}