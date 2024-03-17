"use server";

import Kai from "@/lib/types";
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export const createCheckoutSession = async (cart: Kai.Cart) => {
    try {
        const priceIds = await Promise.all(cart.items.map((item) => stripe.products.retrieve(item.product.stripeId).then((product) => product.default_price as string)));
        const products = priceIds.map((id, index) => {
            return {
                price: id,
                quantity: cart.items[index].count
            }
        });
        const checkoutSession = await stripe.checkout.sessions.create({
            ui_mode: 'embedded',
            payment_method_types: ['card', 'paynow'],
            line_items: products,
            mode: 'payment',
            return_url: `${process.env.NEXT_PUBLIC_URL}/return?session_id={CHECKOUT_SESSION_ID}`,
            submit_type: "pay",
            shipping_address_collection: {
                allowed_countries: ['SG']
            },
            shipping_options: [
                {
                    shipping_rate: "shr_1OvFjhGiBtQvXAdH6hOO94UH"
                }
            ]
        });
        return checkoutSession.client_secret ?? "";
    } catch (error) {
        console.error(error);
        return "";
    }
}

export const getCheckoutSession = async (sessionId: string) => {
    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        return {
            status: session.payment_status,
        } as Kai.CheckoutSession;
    } catch (error) {
        console.error(error);
        return {
            status: "error",
            customer_email: ""
        } as Kai.CheckoutSession;
    }
}