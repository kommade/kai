"use server";

import Kai from "@/lib/types";
import bcrypt from "bcryptjs";
import { getSessionId } from "./sessions-edge";
import { changeSessionIdAfterLogin } from "./sessions-edge";
import { z } from "zod";
import { getUserFromEmail } from "./database-edge";
import { updateUserLastLogin } from "./database-edge";
import { userExists } from "./database-edge";

export const login = async (email: string, password: string) => {
    const user = await userExists(email);
    if (user === null) {
        return { success: false, data: "User not found" };
    }
    if (bcrypt.compareSync(password, user.hash)) {
        await updateUserLastLogin(user.id);
        await changeSessionIdAfterLogin(email);
        return { success: true, data: user };
    } else {
        return { success: false, data: "Incorrect password" };
    }
};

export const isLoggedIn = async (): Promise<boolean> => {
    const session = await getSessionId();
    if (session) {
        if (z.string().email().safeParse(session).success) {
            const user = await userExists(session);
            if (user) {
                return true;
            }
        }
    }
    return false;
}

export const ifLoggedInGetUser = async (): Promise<Kai.UserResult> => {
    const session = await getSessionId();
    if (session) {
        if (z.string().email().safeParse(session).success) {
            const user = await getUserFromEmail(session);
            if (user) {
                return { loggedIn: true, user: user };
            } else {
                return { loggedIn: false, user: "User not found" };
            }
        }
    }
    return { loggedIn: false, user: "Not logged in" };
}