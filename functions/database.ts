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
        if (await redis.exists(key) === 0) {
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
    return tokens[1];
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
    const collections = await redis.lrange('collections', 0, -1);
    return collections;
}, undefined, { revalidate: revalidate })

export const getHomeProductImages = cache(async () => {
    const earringCover = (await redis.sinter("earrings"))[0];
    //const setCover = (await redis.sinter("sets"))[0];
    //const necklaceCover = (await redis.sinter("necklace"))[0];
    const recentCollection = (await redis.lrange("collections", -1, -1))[0];
    const recentCollectionItem = (await redis.sinter(recentCollection))[0];
    //const collectionCover = ???
    // const products = await getProducts([earringCover, setCover, necklaceCover, recentCollectionItem, collectionCover]);
    const products = await getProducts([earringCover, recentCollectionItem]);
    return products.data!.map((product) => product.images[0]);
}, undefined, { revalidate: revalidate })

export const getCart = cache(async (cartId: string)  => {
    const cart = (await redis.hgetall(`cart:${cartId}`)) as Record<string, string>;
    if (cart === null) {
        return [] as Kai.Cart;
    }
    return Object.entries(cart).map(([product, count]) => {
        const productData = JSON.parse(product) as Kai.ProductInCart["product"];
        const countNum = parseInt(count);
        const total = countNum * parseInt(productData.price);
        return { product: productData, stringified: product, count: countNum, total: total } as Kai.ProductInCart;
    });
}, undefined, { revalidate: revalidate })

export const changeProductNumberInCart = async (cartId: string, productInCart: Kai.ProductInCart, amount: number) => {
    if (amount === -1 && await redis.hget(`cart:${cartId}`, productInCart.stringified) === 1) {
        return { success: false, message: "Cannot reduce count below 1, use deleteProductFromCart" };
    }
    await redis.hincrby(`cart:${cartId}`, productInCart.stringified, amount);
    await redis.expire(`cart:${cartId}`, 3600, "GT");
}

export const deleteProductFromCart = async (cartId: string, productInCart: Kai.ProductInCart) => {
    await redis.hdel(`cart:${cartId}`, productInCart.stringified);
}

export const deleteCart = async (cartId: string) => {
    await redis.del(`cart:${cartId}`);
}