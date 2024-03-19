"use server";

import Kai from "@/lib/types";
import { Redis } from '@upstash/redis'
import { unstable_cache as cache, revalidatePath } from "next/cache";
import { getSessionId } from "./sessions";


const redis = Redis.fromEnv();
const revalidate = 3600;

export const getProductKeys = cache(async () => {
    const keys = await redis.scan(0, {match: "product:*"});
    return keys[1];
}, undefined, { revalidate: revalidate })

export const getProducts = cache(async (keys: string[]) => {
    let products: Kai.ProductData[] = [];
    for (let key of keys) {
        if (!key || await redis.exists(key) === 0) {
            return { success: false, message: "Product(s) not found" };
        }
        const res: (Kai.ProductData & { images: string | string[] }) | null = await redis.hgetall(key);
        if (res === null) {
            return { success: false, message: "Product(s) not found" };
        }
        res.images = (res.images as string).split(',');
        res.key = key;
        products.push(res as Kai.ProductData);
    }
    return { success: true, data: products };
}, undefined, { revalidate: revalidate })

export const getTokens = cache(async () => {
    const tokens = await redis.scan(0, {match: "tags:*"});
    return tokens[1].map((token) => token.split(":")[1]);
}, undefined, { revalidate: revalidate })

async function tokeniseSearchInput(input: string) {
    const tokens = await getTokens();
    const tokenDict: Record<string, string[]> = {};
    const presentTokens: Set<string> = new Set();
    
    const regex = /[.,\/#!$%\^&\*;:{}=\-_`~()]/g;
    const spaceRegex = /\s+/g;
    const alphaRegex = /^[a-zA-Z]*$/;
    
    tokens.forEach((token) => {
        const cleanedToken = token.replace(regex, "").replace(spaceRegex, " ").toLowerCase();
        const splitToken = cleanedToken.split(" ").map((subtoken) => {
            return alphaRegex.test(subtoken) ? [subtoken] : subtoken.split("");
        });
        tokenDict[token] = splitToken.flat();
    });
    
    const cleanedInput = input.replace(spaceRegex, " ").toLowerCase().split(" ");
    cleanedInput.forEach((word) => {
        if (!alphaRegex.test(word)) {
            const splitWord = word.split("");
            cleanedInput.splice(cleanedInput.indexOf(word), 1, ...splitWord);
        }
    });
    const split = new Set(cleanedInput);
    
    Object.entries(tokenDict).forEach(([token, subtokens]) => {
        if (subtokens.some(subtoken => split.has(subtoken))) {
            presentTokens.add(token);
        }
    });
    return Array.from(presentTokens);
}

export const searchProducts = cache(async (input: string) => {
    const tags = await tokeniseSearchInput(input);
    if (tags.length === 0) {
        return [];
    }
    tags.forEach((tag) => `tags:${tag}`);
    const result = await redis.sinter(tags[0], ...tags.slice(1));
    return result;
}, undefined, { revalidate: revalidate })

export const getProductKeyFromId = cache(async (id: string) => {
    const key = await redis.hget("idMap", id);
    return key as string;
}, undefined, { revalidate: revalidate })

export const getCollections = cache(async () => {
    const collections = await redis.scan(0, {match: "collections:*"});
    return collections[1].map((collection) => collection.split(":")[1]);
}, undefined, { revalidate: revalidate })

export const getHomeProductImages = cache(async () => {
    const earringCover = (await redis.sinter("tags:earrings"))[0];
    //const setCover = (await redis.sinter("sets"))[0];
    //const necklaceCover = (await redis.sinter("necklace"))[0];
    const recentCollection = await redis.get("recent-collection");
    const recentCollectionItem = (await redis.sinter(recentCollection as string))[0];
    //const collectionCover = ???
    // const products = await getProducts([earringCover, setCover, necklaceCover, recentCollectionItem, collectionCover]);
    const products = await getProducts([earringCover, recentCollectionItem]);
    return products.data!.map((product) => product.images[0]);
}, undefined, { revalidate: revalidate })

export const createCart = async (cartId: string, user = false) => {
    await redis.hset(`cart:${cartId}`, { "Total": 0, converted: false });
    if (!user) {
        await redis.expire(`cart:${cartId}`, process.env.NODE_ENV !== "test" ? 3600 : 10);
    }
}

export const changeCartId = async (oldId: string, newId: string, user: boolean) => {
    await redis.rename(`cart:${oldId}`, `cart:${newId}`);
    if (user) {
        await redis.persist(`cart:${newId}`);
    }
}

export const getCart = async (cartId?: string) => {
    if (!cartId) {
        cartId = await getSessionId() as string;
    }
    const cart = (await redis.hgetall(`cart:${cartId}`)) as Record<string, string>;
    if (cart === null) {
        return null;
    }
    return {
        total: parseFloat(cart["Total"]),
        items: Object.entries(cart).filter(([key, _]) => key !== "Total" && key !== "converted").map(([key, value]) => {
            const product = JSON.parse(key) as Kai.ProductInCart["product"];
            return {
                product: product,
                stringified: key,
                count: parseInt(value),
                total: parseInt(product.price) * parseInt(value)
            }
        }),
        converted: cart.converted === "true"
    } as Kai.Cart;
}

export const changeProductNumberInCart = async (productInCart: Kai.ProductInCart, amount: number, user = false) => {
    const cartId = await getSessionId() as string;
    if (amount === -1 && await redis.hget(`cart:${cartId}`, productInCart.stringified) === 1) {
        return { success: false, message: "Cannot reduce count below 1, use deleteProductFromCart" };
    }
    await redis.hincrby(`cart:${cartId}`, productInCart.stringified, amount);
    if (!user) {
        await redis.expire(`cart:${cartId}`, process.env.NODE_ENV !== "test" ? 3600 : 10, "GT");
    }
    await setCartTotal(cartId);
}

export const deleteProductFromCart = async (productInCart: Kai.ProductInCart, user = false) => {
    const cartId = await getSessionId() as string;
    await redis.hdel(`cart:${cartId}`, productInCart.stringified);
    if (!user) {
        await redis.expire(`cart:${cartId}`, process.env.NODE_ENV !== "test" ? 3600 : 10, "GT");
    }
    await setCartTotal(cartId);
}

export const deleteCart = async (cartId: string) => {
    await redis.del(`cart:${cartId}`);
}

export const setCartTotal = async (cartId: string, user = false) => {
    const cart = await getCart(cartId);
    const total = cart!.items.reduce((acc, curr) => acc + curr.total, 0);
    if (!user) {
        await redis.expire(`cart:${cartId}`, process.env.NODE_ENV !== "test" ? 3600 : 10, "GT");
    }
    await redis.hset(`cart:${cartId}`, { "Total": total });
}

export const getCartTotal = async (user = false) => {
    const cartId = await getSessionId() as string;
    const total = await redis.hget(`cart:${cartId}`, "Total");
    if (!user) {
        await redis.expire(`cart:${cartId}`, process.env.NODE_ENV !== "test" ? 3600 : 10, "GT");
    }
    return total as number;
}

export const preventCartTimeout = async () => {
    const cartId = await getSessionId() as string;
    await redis.persist(`cart:${cartId}`);
}

export const convertCartToOrder = async (checkout: Kai.CheckoutSession) => {
    const cartId = await getSessionId() as string;
    const cart = await getCart(cartId);
    await redis.hset(`cart:${cartId}`, { converted: true });
    if (cart === null) {
        return { success: false, message: "Cart not found" };
    } else if (cart.items.length === 0) {
        return { success: false, message: "Cart is empty" };
    } else if (cart.converted) {
        return { success: false, message: "Cart already converted" };
    } else if (checkout.customer_name === "Playwright Test") {
        return { success: true, message: "Test payment" };
    }
    const orderId = await redis.incr("orderCount");
    const order = { ...cart, ...checkout, order_status: "pending" }
    await redis.hset(`order:${orderId}`, order);
    await deleteCart(cartId);
    return { success: true, orderId: `order:${orderId}` };
}

export const getOrder = async (orderId: string) => {
    const order: Kai.Order | null = await redis.hgetall(orderId);
    return order as Kai.Order;
}

export const getOrders = async () => {
    const orderIds = await redis.scan(0, { match: "order:*" });
    const orders: Kai.Order[] = await Promise.all(orderIds[1].map(async (orderId) => {
        return { ...await redis.hgetall(orderId) } as Kai.Order;
    }));
    return Object.fromEntries(orders.map((order, index) => [orderIds[1][index], order])) as Kai.Orders;
}

export const cancelOrder = async (orderId: string, refundId: string, refundStatus: string) => {
    try {
        await redis.hset(orderId, { order_status: "cancelled", refund_id: refundId, refund_status: refundStatus});
        await redis.expire(orderId, 24 * 3600);
        return { success: true, message: "Order cancelled" };
    } catch (error) {
        return { success: false, message: "Order not found" };
    }
}

export const changeOrderStatus = async (orderId: string, status: Kai.Order["order_status"]) => {
    try {
        await redis.hset(orderId, { order_status: status });
        return { success: true, message: "Order status changed" };
    } catch (error) {
        return { success: false, message: "Order not found" };
    }
}

export const setShippingDetails = async (orderId: string, details: { shipping_provider: string, tracking_number: string }) => {
    try {
        await redis.hset(orderId, details);
        await changeOrderStatus(orderId, "shipped");
        return { success: true, message: "Shipping details set" };
    } catch (error) {
        return { success: false, message: "Order not found" };
    }
}

