"use server";

import { Cart, ProductData } from "@/lib/types";
import { Redis } from '@upstash/redis'
import { unstable_cache as cache } from "next/cache";

const redis = Redis.fromEnv();
const revalidate = 3600;

export const getProductKeys = cache(async () => {
    const keys = await redis.lrange('products', 0, -1);
    return keys;
}, undefined, { revalidate: revalidate })

export const getProducts = cache(async (keys: string[]) => {
    console.log("called!")
    let products: ProductData[] = [];
    for (let key of keys) {
        if (await redis.exists(key) === 0) {
            return { success: false, message: "Product(s) not found" };
        }
        const res: (ProductData & { images: string | string[] }) | null = await redis.hgetall(key);
        if (res === null) {
            return { success: false, message: "Product(s) not found" };
        }
        res.images = (res.images as string).split(',');
        res.key = key;
        products.push(res as ProductData);
    }
    return { success: true, data: products };
}, undefined, { revalidate: revalidate })

export const getTokens = cache(async () => {
    const tokens = await redis.lrange('tokens', 0, -1);
    return tokens;
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
    const tokens = await tokeniseSearchInput(input);
    if (tokens.length === 0) {
        return [];
    }
    const result = await redis.sinter(tokens[0], ...tokens.slice(1));
    return result;
}, undefined, { revalidate: revalidate })

export const getProductKeyFromId = cache(async (id: string) => {
    const key = await redis.get(id);
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
        return [] as Cart;
    }
    const productsInCart = await getProducts(Object.keys(cart));
    return productsInCart.data!.map((product) => {
        return {
            ...product,
            count: parseInt(cart[product.id]),
            total: parseFloat(product.price) * parseInt(cart[product.id]),
            fullName: `${product.collection} - ${product.name}`
        };
    });
}, undefined, { revalidate: revalidate })

export const changeProductNumberInCart = async (key: string, product: string, count: number) => {
    if (await redis.hget(`cart:${key}`, product) === 1 && count === -1) {
        return { success: false, message: "Cannot reduce count below 1, use deleteProductFromCart" };
    }
    await redis.hincrby(`cart:${key}`, product, count);
}

export const deleteProductFromCart = async (cartId: string, product: string) => {
    await redis.hdel(`cart:${cartId}`, product);
}

export const deleteCart = async (cartId: string) => {
    await redis.del(`cart:${cartId}`);
}