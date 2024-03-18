"use client";

import { z } from "zod";

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