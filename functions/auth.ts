"use server";

// this file is isolated as it uses bcrypt which is not supported on the edge

import Kai from "@/lib/types";
import bcrypt from "bcrypt";
import { Redis } from '@upstash/redis'
import { changeSessionId, getSessionId } from "./sessions";
import { z } from "zod";

const redis = Redis.fromEnv();

export const login = async (email: string, password: string) => {
    const user = await redis.hget("users", email) as Kai.User | null;
    if (user === null) {
        return { success: false, data: "User not found" };
    }
    if (bcrypt.compareSync(password, user.hash)) {
        await redis.hset("users", { [email]: JSON.stringify({ ...user, last: new Date().toISOString() }) });
        await changeSessionId(email, true);
        return { success: true, data: user };
    } else {
        return { success: false, data: "Incorrect password" };
    }
};

export const ifLoggedInGetUser = async (): Promise<Kai.UserResult> => {
    const session = await getSessionId();
    if (session) {
        if (z.string().email().safeParse(session).success) {
            const user = await redis.hget("users", session) as Kai.User | null;
            if (user) {
                return { loggedIn: true, user: user };
            } else {
                return { loggedIn: false, user: "User not found" };
            }
        }
    }
    return { loggedIn: false, user: "Not logged in" };
}