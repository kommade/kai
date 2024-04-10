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
