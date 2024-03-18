"use server";

import Kai from "@/lib/types";
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export const createCheckoutSession = async (cart: Kai.Cart, user?: Kai.User) => {
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
            ],
            customer_email: user?.email,
            invoice_creation: {
                enabled: true,
            },
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
            payment_status: session.payment_status,
            address: session.shipping_details?.address,
            customer_name: session.shipping_details?.name,
            customer_email: session.customer_details?.email,
            payment_id: session.payment_intent,
            amount_total: session.amount_total,
            invoice_id: session.invoice as string,
        } as Kai.CheckoutSession;
    } catch (error) {
        console.error(error);
        return {
            payment_status: "error",
        } as Kai.CheckoutSession;
    }
}

export const refundPayment = async (paymentId: string) => {
    try {
        const refund = await stripe.refunds.create({
            payment_intent: paymentId,
        });
        return {
            status: refund.status as "pending" | "requires_action" | "succeeded" | "failed" | "cancelled",
            id: refund.id,
        }
    } catch (error) {
        console.error(error);
        return "error";
    }
}

export const getRefundStatus = async (refundId?: string) => {
    if (!refundId) {
        return "error";
    }
    try {
        const refund = await stripe.refunds.retrieve(refundId);
        return refund.status as "pending" | "requires_action" | "succeeded" | "failed" | "cancelled"
    } catch (error) {
        console.error(error);
        return "error";
    }
}