"use server";

import Kai from "@/lib/types";
import { PrismaClient as PrismaClientEdge } from "@prisma/client/edge"
import { withAccelerate } from "@prisma/extension-accelerate";
import { z } from "zod";

const prismaEdge = new PrismaClientEdge().$extends(withAccelerate());

export const createCartEdge: (cartId: string, user: boolean) => Promise<void> = async (cartId: string, user: boolean) => {
    await prismaEdge.$runCommandRaw({
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
};

export const userExists: (email: string) => Promise<Pick<Kai.User, "id" | "hash"> | null> = async (email: string) => {
    return await prismaEdge.users.findUnique({
        where: {
            email,
        },
        select: {
            id: true,
            hash: true,
            role: true,
        },
        cacheStrategy: {
            swr: process.env.NODE_ENV === 'production' ? 30 : 0,
        }
    });
}
    
export const updateUserLastLogin: (id: string) => Promise<void> = async (id: string) => {
    await prismaEdge.users.update({
        where: {
            id,
        },
        data: {
            last: new Date(),
        },
    });
};

export const getUserFromEmail: (email: string) => Promise<Kai.User | null> = async (email: string) => {
    return await prismaEdge.users.findUnique({
        where: {
            email,
        },
        cacheStrategy: {
            swr: process.env.NODE_ENV === 'production' ? 30 : 0,
        }
    });
}
// only happens at login: session_id -> user_id

export const changeCartId: (oldId: string, newId: string) => Promise<void> = async (oldId: string, newId: string) => {
    const user_id = (await getUserFromEmail(newId))!.id
    const newCart = await prismaEdge.carts.findUnique({
        where: {
            user_id,
        },
        select: {
            id: true,
        }
    });

    if (newCart) {
        const oldCart = await prismaEdge.carts.findUnique({
            where: {
                session_id: oldId,
            },
        }) as Kai.Cart;
        await prismaEdge.$runCommandRaw({
            update: "carts",
            updates: [{
              q: { _id: newCart.id },
              u: { $set: { session_id: null, user_id: { "$oid": user_id }, items: oldCart.items, total: oldCart.total } }
            }]
        });
        await deleteCart(oldId);
    } else {
        await prismaEdge.$runCommandRaw({
            update: "carts",
            updates: [{
              q: { session_id: oldId },
              u: { $set: { session_id: null, user_id: { "$oid": user_id } } }
            }]
        });
    }
    persistCart(user_id);
};

const persistCart: (id: string) => Promise<void> = async (id: string) => {
    if (process.env.NODE_ENV === 'test') return;
    await prismaEdge.carts.update({
        where: {
            user_id: id,
        },
        data: {
            expires: new Date(Date.now() + 24*60*60*1000)
        },
    });
}

const deleteCart: (id: string) => Promise<void> = async (id: string) => {
    await prismaEdge.carts.delete({
        where: {
            session_id: id,
        },
    });
}