"use server";

import Kai from "@/lib/types";
import { Redis } from '@upstash/redis'
import { unstable_cache as cache } from "next/cache";

const redis = Redis.fromEnv();
const revalidate = 3600;

export const getProductKeys = cache(async () => {
    const keys = await redis.scan(0, {match: "product:*"});
    return keys[1];
}, undefined, { revalidate: revalidate })

export const getProducts = cache(async (keys: string[]) => {
    console.log("called!")
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
    console.log(key);
    return key as string;
}, undefined, { revalidate: revalidate })

export const getCollections = cache(async () => {
    const collections = await redis.scan(0, {match: "collection:*"});
    return collections[1];
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

export const createCart = async (cartId: string) => {
    await redis.hset(`cart:${cartId}`, { "Total": 0 });
}

export const getCart = cache(async (cartId: string) => {
    const cart = (await redis.hgetall(`cart:${cartId}`)) as Record<string, string>;
    if (cart === null) {
        return null;
    }
    return {
        total: parseFloat(cart["Total"]),
        items: Object.entries(cart).filter(([key, value]) => key !== "Total").map(([key, value]) => {
            const product = JSON.parse(key) as Kai.ProductInCart["product"];
            return {
                product: product,
                stringified: key,
                count: parseInt(value),
                total: parseInt(product.price) * parseInt(value)
            }
        })
    } as Kai.Cart;
}, undefined, { revalidate: revalidate }) //0.5

export const changeProductNumberInCart = async (cartId: string, productInCart: Kai.ProductInCart, amount: number) => {
    if (amount === -1 && await redis.hget(`cart:${cartId}`, productInCart.stringified) === 1) {
        return { success: false, message: "Cannot reduce count below 1, use deleteProductFromCart" };
    }
    await redis.hincrby(`cart:${cartId}`, productInCart.stringified, amount);
    await redis.expire(`cart:${cartId}`, 3600, "GT");
    await setCartTotal(cartId);
}

export const deleteProductFromCart = async (cartId: string, productInCart: Kai.ProductInCart) => {
    await redis.hdel(`cart:${cartId}`, productInCart.stringified);
    await redis.expire(`cart:${cartId}`, 3600, "GT");
    await setCartTotal(cartId);
}

export const deleteCart = async (cartId: string) => {
    await redis.del(`cart:${cartId}`);
}

export const setCartTotal = async (cartId: string) => {
    const cart = await getCart(cartId);
    const total = cart!.items.reduce((acc, curr) => acc + curr.total, 0);
    await redis.expire(`cart:${cartId}`, 3600, "GT");
    await redis.hset(`cart:${cartId}`, { "Total": total });
}

export const getCartTotal = async (cartId: string) => {
    await setCartTotal(cartId);
    const total = await redis.hget(`cart:${cartId}`, "Total");
    await redis.expire(`cart:${cartId}`, 3600, "GT");
    return total as number;
}

export const convertCartToOrder = async (cartId: string, checkout: Kai.CheckoutSession) => {
    const cart = await getCart(cartId);
    if (cart === null) {
        return { success: false, message: "Cart not found" };
    }
    const orderId = await redis.incr("orderCount");
    await redis.hset(`order:${orderId}`, { ...cart, ...checkout });
    await deleteCart(cartId);
    return { success: true, orderId: orderId };
}

export const preventCartTimeout = async (cartId: string) => {
    await redis.persist(`cart:${cartId}`);
}

export const getOrder = async (orderId: number) => {
    const order = await redis.hgetall(`order:${orderId}`);
    if (order === null) {
        return { success: false, message: "Order not found" };
    }
    return { success: true, data: order };
}