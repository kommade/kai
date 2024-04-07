"use client";

import { string, z } from "zod";
import Kai, { Expand } from "./types";
import { carts, orders } from "@prisma/client";
import Stripe from "stripe";

export const loginFormSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

export const shippingProviders = ['SingPost'] as const;

export const shippingFormSchema = z.object({
    shipping_provider: z.enum(shippingProviders, {
        errorMap: (_, __) => ({
            message: `Provider must be ${shippingProviders.length > 1 ? "one of" : ""} ${(new Intl.ListFormat('en-us', { type: 'disjunction' }))
                .format(shippingProviders)}`
        })
    }),
    tracking_number: z.string().regex(/^RA[0-9]{9}SG$/, 'Invalid tracking number'),
});

const zodCustomer = z.object({
    email: z.string().email(),
    name: z.string(),
});

const orderSchema = z.object({
    id: z.string(),
    amount_total: z.number(),
    user_id: z.string().nullable(),
    invoice_id: z.string(),
    order_id: z.number(),
    order_status: z.enum(['pending', 'shipped', 'delivered', 'refunded', 'cancelled']),
    payment_id: z.string(),
    payment_status: z.enum(['paid', 'unpaid']),
    shipping_provider: z.enum(shippingProviders).nullable(),
    tracking_number: z.string().regex(/^RA[0-9]{9}SG$/).nullable(),
    refund_id: z.string().nullable(),
    address: z.object({
        line1: z.string().nullable(),
        line2: z.string().nullable(),
        city: z.string().nullable(),
        postal_code: z.string().nullable(),
        state: z.string().nullable(),
        country: z.string().nullable(),
    }),
    items: z.array(z.object({
        selection_id: z.string(),
        count: z.number(),
        total: z.number(),
    })),
    customer: zodCustomer.nullable(),
    user: z.object({
        id: z.string(),
        email: z.string().email(),
        hash: z.string(),
        last: z.coerce.date(),
        role: z.enum(['admin', 'user']),
        verified: z.boolean(),
        name: z.string(),
    }).optional().nullable(),
})

export const zodValidateOrder = orderSchema.refine(data => {
    return (data.user_id == null) !== (data.customer == null);
}, {
    message: "Either user_id or customer must be provided but not both",
});

export const zodValidateOrderWithProducts = orderSchema.extend({
    items: z.array(z.object({
        product: z.object({
            id: z.string(),
            name: z.string(),
            price: z.number(),
            image: z.string().url(),
            collection: z.object({
                name: z.string(),
            }),
            options: z.array(z.object({
                name: z.string(),
                selection: z.array(z.string()),
            })),
            stripe_id: z.string(),
            url: z.string(),
            type: z.enum(['earrings', 'necklaces', "sets"]),
        }),
        count: z.number(),
        total: z.number(),
        selected_options: z.array(z.number()),
        selection_id: z.string(),
    })),
}).refine(data => {
    return (data.user_id == null) !== (data.customer == null);
}, {
    message: "Either user_id or customer must be provided but not both",
});

type e = carts

const cartSchema = z.object({
    id: z.string(),
    session_id: z.string().nullable(),
    user_id: z.string().nullable(),
    items: z.array(z.object({
        product_id: z.string(),
        count: z.number(),
        selected_options: z.array(z.number()),
    })),
    total: z.number(),
    converted: z.boolean(),
    expires: z.coerce.date(),
});

export const zodValidateCart = cartSchema.refine(data => {
    return (data.user_id == null) !== (data.session_id == null);
}, {
    message: "Either user_id or session_id must be provided but not both",
});

export const zodValidateCartWithProducts = cartSchema.extend({
    items: z.array(z.object({
        product: z.object({
            id: z.string(),
            name: z.string(),
            price: z.number(),
            image: z.string().url(),
            collection: z.object({
                name: z.string(),
            }),
            options: z.array(z.object({
                name: z.string(),
                selection: z.array(z.string()),
            })),
            stripe_id: z.string(),
            url: z.string(),
            type: z.enum(['earrings', 'necklaces', "sets"]),
        }),
        count: z.number(),
        total: z.number(),
        selected_options: z.array(z.number()),
        selection_id: z.string(),
    })),
}).refine(data => {
    return (data.user_id == null) !== (data.session_id == null);
}, {
    message: "Either user_id or session_id must be provided but not both",
});