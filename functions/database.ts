"use server";
import { CartItems, OrdersItems, PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';
import Kai from "@/lib/types";
import { unstable_cache as cache } from "next/cache";
import { getSessionIdOrNew } from "./sessions";
import { userExists } from "./database-edge";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient().$extends(withAccelerate());

const revalidate = 3600;

type CartOverload<T> = {
    (email: string, user: boolean): Promise<T>;
    (session_id?: string, user?: boolean): Promise<T>;
}

type CartOverloadRequired<T> = {
    (email: string, user: boolean): Promise<T>;
    (session_id: string, user?: boolean): Promise<T>;
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

export const getProductByUrl: (url: string) => Promise<Kai.ProductWithCollectionOptions | null> = cache(async (url: string) => {
    return await prisma.products.findUnique({
        where: {
            url,
        },
        include: {
            collection: true,
            options: true,
        },
        cacheStrategy: {
            ttl: process.env.NODE_ENV === 'production' ? 3600 : 0,
        }
    });
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

export const getProductsStripeIdById: (ids: string[]) => Promise<Pick<Kai.Product, "stripe_id">[]> = cache(async (ids: string[]) => {
    return await prisma.products.findMany({
        where: {
            id: {
                in: ids,
            },
        },
        select: {
            stripe_id: true,
        },
        cacheStrategy: {
            ttl: process.env.NODE_ENV === 'production' ? 3600 : 0,
        }
    });
}, undefined, { revalidate: revalidate })

export const getProductInCart: (item: OrdersItems) => Promise<Kai.ProductInCart | null> = cache(async (item: OrdersItems) => {
    const [product_id, selected_options] = item.selection_id.split("-");
    const product = await prisma.products.findUnique({
        where: {
            id: product_id,
        },
        include: {
            collection: true,
            options: true,
        },
        cacheStrategy: {
            ttl: process.env.NODE_ENV === 'production' ? 3600 : 0,
        }
    });
    if (!product) return null;
    const selectedOptions = selected_options.split("").map(option => parseInt(option));
    return {
        product: {
            ...product,
            collection: {
                name: product.collection.name,
            },
            image: product.images[0],
        },
        selected_options: selectedOptions,
        count: item.count,
        total: item.total,
        selection_id: item.selection_id,
    };
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

export const createCart: CartOverloadRequired<string> = async (cartId: string, user: boolean = false) => {
    console.log(cartId);
    const cart = await prisma.$runCommandRaw({
        insert: "carts",
        documents: [{
            session_id: user ? undefined : cartId,
            user_id: user ? {"$oid": (await getUserFromEmail(cartId))!.id} : undefined,
            items: [],
            total: 0,
            converted: false,
            expires: { "$date": process.env.NODE_ENV === 'test' ? new Date(Date.now() + 10000) : user ? new Date(Date.now() + 24*60*60*1000) : new Date(Date.now() + 60*60*1000)}
        }]
    });
    console.log(cart);
    return cart.id as string;
}


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

export const getUserFromId: (user_id: string) => Promise<Kai.User> = cache(async (user_id: string) => {
    return await prisma.users.findUnique({
        where: {
            id: user_id,
        },
        cacheStrategy: {
            ttl: process.env.NODE_ENV === 'production' ? 24 * 3600 : 0,
        }
    }) as Kai.User;
}, undefined, { revalidate: revalidate })

export const getUserFromEmail: (email: string) => Promise<Kai.User | null> = async (email: string) => {
    return await prisma.users.findUnique({
        where: {
            email,
        },
        cacheStrategy: {
            swr: process.env.NODE_ENV === 'production' ? 30 : 0,
        }
    });
}

export const persistCart = async (id_?: string, user: boolean = false) => {
    if (process.env.NODE_ENV === 'test' || !id_) return;
    await prisma.carts.update({
        where: {
            id: id_,
        },
        data: {
            expires: user ? new Date(Date.now() + 24 * 60 * 60 * 1000) : new Date(Date.now() + 60 * 60 * 1000),
        },
    });
}

export const persistCartInfinitely = async (user: boolean = false) => {
    if (process.env.NODE_ENV === 'test') return;
    const cartId = await getSessionIdOrNew();
    const cart = await getCart(cartId, user ? true : false);
    await prisma.carts.update({
        where: {
            id: cart.id,
        },
        data: {
            expires: new Date(Date.now() + Number(1 << 36)),
        },
    });
}

/**
 * Retrieves a cart from the database.
 * 
 * @param cartId - The ID of the cart to retrieve. If not provided, the session ID will be used.
 * @param user - Indicates whether the cart belongs to a user. Defaults to false.
 * @returns A Promise that resolves to the retrieved cart.
 */
export const getCart: CartOverload<Kai.Cart> = cache(async (cartId?: string, user: boolean = false) => {
    if (!cartId) {
        cartId = await getSessionIdOrNew();
    }
    let cart;
    if (user) {
        const user_id = await getUserId(cartId);
        cart = await prisma.carts.findUnique({
            where: {
                user_id,
            },
            cacheStrategy: {
                swr: process.env.NODE_ENV === 'production' ? 1 : 0,
            }
        });
    } else {
        cart = await prisma.carts.findUnique({
            where: {
                session_id: cartId,
            },
            cacheStrategy: {
                swr: process.env.NODE_ENV === 'production' ? 1 : 0,
            }
        });
    }
    persistCart(cart?.id);
    if (!cart) {
        await createCart(cartId, user);
        return await getCart(cartId, user);
    }
    return cart as Kai.Cart;
}, undefined, { revalidate: 1 })

export const getCartDBId: CartOverload<string | undefined> = cache(async (cartId?: string, user: boolean = false) => {
    if (!cartId) {
        cartId = await getSessionIdOrNew();
    }
    let cart;
    if (user) {
        cart = await prisma.carts.findUnique({
            where: {
                user_id: await getUserId(cartId),
            },
            select: {
                id: true,
            },
            cacheStrategy: {
                swr: process.env.NODE_ENV === 'production' ? 30 : 0,
            }
        });
    } else {
        cart = await prisma.carts.findUnique({
            where: {
                session_id: cartId,
            },
            select: {
                id: true,
            },
            cacheStrategy: {
                swr: process.env.NODE_ENV === 'production' ? 30 : 0,
            }
        });
    }
    persistCart(cart?.id, user);
    return cart?.id;
}, undefined, { revalidate: 1 })

export const getCartWithProducts: CartOverload<Kai.CartWithProducts> = cache(async (cartId?: string, user: boolean = false) => {
    const cart = await getCart(cartId, user);
    const items = await Promise.all(cart.items.map((item) => getProductInCart(item)));
    return {
        ...cart,
        items: items.filter((item) => item !== null) as Kai.ProductInCart[],
    };
}, undefined, { revalidate: 1 })

export const changeProductNumberInCart = async (selection_id: string, amount: number, price: number, user: boolean = false) => {
    try {
        const cartId = await getSessionIdOrNew();
        const productInCartToUpdate: CartItems = {
            selection_id,
            count: amount,
            total: price * amount,
        };

        const oldCart = await getCart(cartId, user);

        const itemIndex = oldCart.items.findIndex(item => item.selection_id === productInCartToUpdate.selection_id);

        if (itemIndex !== -1) {
            if (oldCart.items[itemIndex].count + amount <= 0) {
                throw new Error("Cannot reduce the count of an item to less than 1");
            }
            oldCart.items[itemIndex].count += amount;
            oldCart.items[itemIndex].total += price * amount;
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
                total: oldCart.total + price * amount,
            },
        });
        persistCart(oldCart.id, user);
        return true
    } catch (error) {
        console.error(error);
        return false
    }
    
}

export const deleteProductFromCart: (selection_id: string, user?: boolean) => Promise<boolean> = async (selection_id: string, user: boolean = false) => {
    const _id = await getCartDBId(await getSessionIdOrNew(), user);
    if (!_id) return false;
    await prisma.carts.update({
        where: {
            id: _id,
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
    updateCartTotal(_id, user);
    persistCart(_id, user);
    return true
}

export const deleteCart: (_id: string) => Promise<void> = async (_id: string) => {
    await prisma.carts.delete({
        where: {
            id: _id,
        },
    });
}

export const updateCartTotal: (cartId: string, user: boolean) => Promise<void> = async (cartId: string, user: boolean = false) => {
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
}

export const getCartTotal: (user: boolean) => Promise<number> = cache(async (user: boolean = false) => {
    const cartId = await getSessionIdOrNew();
    if (user) {
        return (await prisma.carts.findUnique({
            where: {
                user_id: cartId,
            },
            select: {
                total: true,
            },
            cacheStrategy: {
                swr: process.env.NODE_ENV === 'production' ? 1 : 0,
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
                swr: process.env.NODE_ENV === 'production' ? 1 : 0,
            }
        }))!.total;
    }
}, undefined, { revalidate: 1 })

export const convertCartToOrder = async (checkout: Kai.CheckoutSession, user: boolean = false) => {
    const cartId = await getSessionIdOrNew();
    const cart = await getCart(cartId, user);
    await prisma.carts.update({
        where: {
            id: cart.id,
        },
        data: {
            converted: true,
        },
    });
    if (cart.items.length === 0 || cart.converted) {
        return { success: false, error: "Cart is empty or has already been converted" };
    }
    if (checkout.customer_name === "Playwright Test") {
        return { success: true };
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
            user_id: cart.user_id,
            invoice_id: checkout.invoice_id,
            items: cart.items,
            order_id: nextOrderId,
            order_status: "pending",
            payment_id: checkout.payment_id,
            payment_status: checkout.payment_status,
        },
    });
    deleteCart(cartId);
    return { success: true, order_id: nextOrderId };
}

export const getOrder: (order_id: number) => Promise<Kai.Order | null> = cache(async (order_id: number) => {
    return await prisma.orders.findUnique({
        where: {
            order_id,
        },
        include: {
            user: true,
        },
        cacheStrategy: {
            swr: process.env.NODE_ENV === 'production' ? 5 : 0,
        }
    });
}, undefined, { revalidate: 1 })

export const getOrderWithProducts: (order_id: number) => Promise<Kai.OrderWithProducts | null> = cache(async (order_id: number) => {
    const order = await prisma.orders.findUnique({
        where: {
            order_id,
        },
        cacheStrategy: {
            swr: process.env.NODE_ENV === 'production' ? 5 : 0,
        }
    });
    if (!order) return null;
    const items = await Promise.all(order.items.map((item) => getProductInCart(item)));
    if (items.includes(null)) return null;
    return {
        ...order,
        items,
    };
}, undefined, { revalidate: 1 })

export const getUserOrdersByEmail: (email: string) => Promise<Kai.Order[]> = cache(async (email: string) => {
    const user_id = await getUserId(email);
    return await prisma.orders.findMany({
        where: {
            user_id,
        },
        orderBy: {
            order_id: "asc",
        },
        cacheStrategy: {
            swr: process.env.NODE_ENV === 'production' ? 30 : 0,
        }
    });
}, undefined, { revalidate: 1 })

export const getAllOrders: () => Promise<Kai.Order[]> = cache(async () => {
    return await prisma.orders.findMany({
        include: {
            user: true,
        },
        orderBy: {
            order_id: "asc",
        },
        cacheStrategy: {
            swr: process.env.NODE_ENV === 'production' ? 30 : 0,
        }
    });
}, undefined, { revalidate: 10 })

export const cancelOrder = async (order_id: number, refund_id: string) => {
    try {
        await prisma.orders.update({
            where: {
                order_id,
            },
            data: {
                order_status: "cancelled",
                refund_id,
            },
        });
        return { success: true }
    } catch (error) {
        return { success: false, error };
    }
}

export const changeOrderStatus = async (order_id: number, status: string) => {
    try {
        await prisma.orders.update({
            where: {
                order_id,
            },
            data: {
                order_status: status,
            },
        });
    } catch (error) {
        return { success: false, error };
    }
    return { success: true };
}

export const setShippingDetails = async (order_id: number, details: { shipping_provider: string, tracking_number: string }) => {
    try {
        await prisma.orders.update({
            where: {
                order_id,
            },
            data: {
                shipping_provider: details.shipping_provider,
                tracking_number: details.tracking_number,
            },
        });
        return { success: true };
    } catch (error) {
        return { success: false, error };
    }
}

export const checkNewUser = async (email: string) => {
    if (await userExists(email)) {
        return false;
    }
    return true;
}

export const createNewUser: (email: string, password: string, name: string, customer_id: string) => Promise<boolean> = async (email: string, password: string, name: string, customer_id: string) => {
    if (await userExists(email)) {
        return false;
    }
    const hash = await bcrypt.hash(password, 12);
    try {
        await prisma.users.create({
            data: {
                email,
                name,
                hash,
                last: new Date(),
                role: "user",
                customer_id
            },
        });
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}