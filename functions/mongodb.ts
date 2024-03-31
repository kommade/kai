"use server";
import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';
import Kai from "@/lib/types";
import { unstable_cache as cache } from "next/cache";
import { getSessionId } from "./sessions";

const prisma = new PrismaClient().$extends(withAccelerate());
const revalidate = 3600;

type CartOverload<T> = {
    (email: string, user: boolean): Promise<T>;
    (session_id: string): Promise<T>;
}

export const getProductIds: () => Promise<Kai.ProductId[]> = cache(async () => {
    const products = await prisma.products.findMany({
        select: {
            id: true,
        },
        cacheStrategy: {
            ttl: process.env.NODE_ENV === 'production' ? 3600 : 0,
        }
    });
    return products.map((product) => product.id);
}, undefined, { revalidate: revalidate })

export const getProductByUrl: (url: string) => Promise<Kai.ProductWithCollectionOptions[]> = cache(async (url: string) => {
    return (await prisma.products.findMany({
        where: {
            url: {
                equals: url,
            },
        },
        include: {
            collection: true,
            options: true,
        },
        cacheStrategy: {
            ttl: process.env.NODE_ENV === 'production' ? 3600 : 0,
        }
    }));
}, undefined, { revalidate: revalidate })

export const getProductsById: (ids: string[]) => Promise<Kai.ProductWithCollection[]> = cache(async (ids: string[]) => {
    return await prisma.products.findMany({
        where: {
            id: {
                in: ids,
            },
        },
        include: {
            collection: true,
        },
        cacheStrategy: {
            ttl: process.env.NODE_ENV === 'production' ? 3600 : 0,
        }
    });
}, undefined, { revalidate: revalidate })

export const searchForProducts: (input: string) => Promise<Kai.ProductId[]> = cache(async (input: string) => {
    const products = await prisma.products.findRaw({
        filter: {
            $text: {
                $search: input,
            },
        }
    }) as unknown as { _id: { '$oid': string }, [key: string]: any }[];
    return products.map((product) => product._id['$oid']);
}, undefined, { revalidate: revalidate })

export const getCollections: () => Promise<Kai.Collection[]> = cache(async () => {
    return prisma.collections.findMany({
        cacheStrategy: {
            ttl: process.env.NODE_ENV === 'production' ? 3600 : 0,
        }
    });
}, undefined, { revalidate: revalidate })

export const getHomeProductImages: () => Promise<string[]> = cache(async () => {
    const earringCover = await prisma.products.findFirst({
        where: {
            type: {
                equals: "earrings",
            },
        },
        select: {
            images: true,
        },
        cacheStrategy: {
            ttl: process.env.NODE_ENV === 'production' ? 24 * 3600 : 0,
        }
    });
    // const necklaceCover = await prisma.products.findFirst({
    //     where: {
    //         type: {
    //             equals: "necklaces",
    //         },
    //     },
    //     select: {
    //         images: true,
    //     },
    //     cacheStrategy: {
    //         ttl: process.env.NODE_ENV === 'production' ? 3600 : 0,
    //     }
    // });
    // const setCovers = await prisma.products.findFirst({
    //     where: {
    //         type: {
    //             equals: "sets",
    //         },
    //     },
    //     select: {
    //         images: true,
    //     },
    //     cacheStrategy: {
    //         ttl: process.env.NODE_ENV === 'production' ? 3600 : 0,
    //     }
    // });
    const recentCollection = await prisma.collections.findFirst({
        orderBy: {
            created_at: "desc",
        },
        select: {
            product_ids: true,
        },
        cacheStrategy: {
            ttl: process.env.NODE_ENV === 'production' ? 24 * 3600 : 0,
        }
    });
    const recentCollectionItem = await prisma.products.findFirst({
        where: {
            id: {
                equals: recentCollection!.product_ids[0],
            },
        },
        select: {
            images: true,
        },
        cacheStrategy: {
            ttl: process.env.NODE_ENV === 'production' ? 24 * 3600 : 0,
        }
    });
    // const collectionCover = ???;
    // return [earringCover!.images[0], necklaceCover!.images[0], setCovers!.images[0], recentCollectionItem!.images[0]];
    return [earringCover!.images[0], recentCollectionItem!.images[0]];
}, undefined, { revalidate: revalidate })

export const createCart: CartOverload<void> = cache(async (cartId: string, user: boolean = false) => {
    // user = false, cartId = session id; user = true, cartId = user id
    await prisma.carts.create({
        data: {
            session_id: user ? undefined : cartId,
            user_id: user ? cartId : undefined,
            items: [],
            total: 0,
            converted: false,
            expires: process.env.NODE_ENV === 'test' ? new Date(Date.now() + 10000) : user ? new Date(Date.now() + 24*60*60*1000) : new Date(Date.now() + 60*60*1000)
        },
        
    });
}, undefined, { revalidate: revalidate })

export const getUserId: (email: string) => Promise<string | undefined> = cache(async (email: string) => {
    const user = await prisma.users.findUnique({
        where: {
            email,
        },
        select: {
            id: true,
        },
        cacheStrategy: {
            ttl: process.env.NODE_ENV === 'production' ? 24 * 3600 : 0,
        }
    });
    return user?.id;
}, undefined, { revalidate: revalidate })

export const persistCart: (id_: string, user: boolean) => void = cache(async (id_: string, user: boolean = false) => {
    if (process.env.NODE_ENV === 'test') return;
    await prisma.carts.update({
        where: {
            id: id_,
        },
        data: {
            expires: user ? new Date(Date.now() + 24*60*60*1000) : new Date(Date.now() + 60*60*1000),
        },
    });
}, undefined, { revalidate: revalidate })

// only happens at login: session_id -> user_id
export const changeCartId: (oldId: string, newId: string) => void = cache(async (oldId: string, newId: string) => {
    const newCart = await prisma.carts.findUnique({
        where: {
            user_id: newId,
        },
        select: {
            id: true,
        }
    })
    
    if (newCart) {
        const oldCart = await prisma.carts.findUnique({
            where: {
                session_id: oldId,
            },
        }) as Kai.Cart;
        await prisma.carts.update({
            where: {
                id: newCart.id,
            },
            data: {
                session_id: undefined,
                user_id: newId,
                items: oldCart.items,
                total: oldCart.total,
            },
        });
    } else {
        await prisma.carts.update({
            where: {
                session_id: oldId,
            },
            data: {
                session_id: undefined,
                user_id: newId,
            },
        });
    }
    persistCart(newId, true);
    deleteCart(oldId);
}, undefined, { revalidate: revalidate })

/**
 * Retrieves a cart from the database.
 * 
 * @param cartId - The ID of the cart to retrieve. If not provided, the session ID will be used.
 * @param user - Indicates whether the cart belongs to a user. Defaults to false.
 * @returns A Promise that resolves to the retrieved cart.
 */
export const getCart: CartOverload<Kai.Cart> = cache(async (cartId?: string, user: boolean = false) => {
    if (!cartId) {
        cartId = await getSessionId();
    }
    persistCart(cartId, user);
    if (user) {
        return await prisma.carts.findUnique({
            where: {
                user_id: cartId,
            },
            cacheStrategy: {
                swr: process.env.NODE_ENV === 'production' ? 30 : 0,
            }
        }) as Kai.Cart;
    } else {
        return await prisma.carts.findUnique({
            where: {
                session_id: cartId,
            },
            cacheStrategy: {
                swr: process.env.NODE_ENV === 'production' ? 30 : 0,
            }
        }) as Kai.Cart;
    }
}, undefined, { revalidate: revalidate })

export const changeProductNumberInCart: (product: Kai.Product, amount: number, selectedOptions: number[], user: boolean) => void = cache(async (product: Kai.Product, amount: number, selectedOptions: number[], user: boolean = false) => {
    const cartId = await getSessionId();
    const productInCartToUpdate: Kai.ProductInCart = {
        selection_id: `${product.id}-${selectedOptions.join('')}`,
        count: amount,
        total: product.price * amount,
    };

    const oldCart = await getCart(cartId, user);

    const itemIndex = oldCart.items.findIndex(item => item.selection_id === productInCartToUpdate.selection_id);

    if (itemIndex !== -1) {
        if (oldCart.items[itemIndex].count + amount <= 0) {
            throw new Error("Cannot reduce the count of an item to less than 1");
        }
        oldCart.items[itemIndex].count += amount;
        oldCart.items[itemIndex].total += product.price * amount;
    } else {
        oldCart.items.push(productInCartToUpdate);
    }

    await prisma.carts.update({
        where: {
            id: oldCart.id,
        },
        data: {
            items: oldCart.items,
            expires: process.env.NODE_ENV === 'test' ? new Date(Date.now() + 10000) : user ? new Date(Date.now() + 24*60*60*1000) : new Date(Date.now() + 60*60*1000),
            total: oldCart.total + product.price * amount,
        },
    });
    persistCart(cartId, user);
}, undefined, { revalidate: revalidate })

export const deleteProductFromCart: (selection_id: string, user: boolean) => void = cache(async (selection_id: string, user: boolean = false) => {
    const cartId = await getSessionId();
    await prisma.carts.update({
        where: {
            session_id: cartId,
        },
        data: {
            items: {
                deleteMany: {
                    where: {
                        selection_id: {
                            equals: selection_id,
                        },
                    },
                },
            },
        },
    });
    updateCartTotal(cartId, user);
    persistCart(cartId, user);
}, undefined, { revalidate: revalidate })

export const deleteCart: (_id: string) => void = cache(async (_id: string) => {
    await prisma.carts.delete({
        where: {
            id: _id,
        },
    });
}, undefined, { revalidate: revalidate })

export const updateCartTotal: (cartId: string, user: boolean) => void = cache(async (cartId: string, user: boolean = false) => {
    const cart = await getCart(cartId, user);
    const total = cart.items.reduce((acc, item) => acc + item.total, 0);
    await prisma.carts.update({
        where: {
            id: cart.id,
        },
        data: {
            total,
        },
    });
}, undefined, { revalidate: revalidate })

export const getCartTotal: (user: boolean) => Promise<number> = cache(async (user: boolean = false) => {
    const cartId = await getSessionId();
    if (user) {
        return (await prisma.carts.findUnique({
            where: {
                user_id: cartId,
            },
            select: {
                total: true,
            },
            cacheStrategy: {
                swr: process.env.NODE_ENV === 'production' ? 30 : 0,
            }
        }))!.total;
    } else {
        return (await prisma.carts.findUnique({
            where: {
                session_id: cartId,
            },
            select: {
                total: true,
            },
            cacheStrategy: {
                swr: process.env.NODE_ENV === 'production' ? 30 : 0,
            }
        }))!.total;
    }
}, undefined, { revalidate: revalidate })

export const convertCartToOrder: (checkout: Kai.CheckoutSession) => Promise<boolean> = cache(async (checkout: Kai.CheckoutSession) => {
    const cartId = await getSessionId();
    const cart = await getCart(cartId);
    await prisma.carts.update({
        where: {
            id: cart.id,
        },
        data: {
            converted: true,
        },
    });
    if (cart.items.length === 0 || cart.converted) {
        return false;
    }
    if (checkout.customer_name === "Playwright Test") {
        return true;
    }
    const nextOrderId = await prisma.orders.count();
    await prisma.orders.create({
        data: {
            address: checkout.address,
            amount_total: checkout.amount_total,
            customer: {
                name: checkout.customer_name,
                email: checkout.customer_email,
            },
            userId: cart.user_id,
            invoice_id: checkout.invoice_id,
            items: cart.items,
            order_id: nextOrderId,
            order_status: "pending",
            payment_id: checkout.payment_id,
            payment_status: checkout.payment_status,
            total: checkout.amount_total
        },
    });
    deleteCart(cartId);
    return true;
}, undefined, { revalidate: revalidate })