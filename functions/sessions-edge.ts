"use server";

import { cookies } from "next/headers";
import { createCartEdge } from "./database-edge";
import { crypto } from "@edge-runtime/ponyfill";
import { SignJWT, jwtVerify } from "jose"
import { JWTExpired } from "jose/errors";

const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET as string);

export async function createSessionIdEdge() {
    const newSessionId = crypto.randomUUID();
    await createCartEdge(newSessionId, false);
    return newSessionId;
}

export async function setSessionId(sessionId: string, user: boolean = false) {
    const cookieStore = cookies();
    const jwt = new SignJWT({ sessionId }).setProtectedHeader({ alg: "HS256" }).setExpirationTime(process.env.NODE_ENV === "test" ? "10s" : user ? "1d" : "1h");
    cookieStore.set({
        name: "session-id",
        value: await jwt.sign(jwtSecret),
        httpOnly: process.env.NODE_ENV === "production",
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });
    createCartEdge(sessionId, user);
}
export async function getSessionId() {
    const session = cookies().get("session-id")?.value;
    if (session === undefined) {
        return null;
    }
    try {
        const jwt = await jwtVerify(session, jwtSecret);
        return jwt.payload.sessionId as string;
    } catch (error) {
        if (error instanceof JWTExpired) {
            return await changeSessionId();
        }
        return null
    }
}

export async function changeSessionIdAfterLogin(newSessionId: string) {
    setSessionId(newSessionId, true);
}

export async function changeSessionId() {
    const session_id = await createSessionIdEdge()
    setSessionId(session_id, false);
    return session_id;
}
