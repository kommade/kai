"use server";

import { cookies } from "next/headers";
import { deleteCart } from "./database";
import { changeSessionId, createSessionIdEdge } from "./sessions-edge";
import { setSessionId } from "./sessions-edge";
import { jwtVerify } from "jose";
import { JWTExpired } from "jose/errors";

export type SessionId = string;
const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET as string);

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
        console.error(error);
        return null
    }
}

export async function getSessionIdOrNew() {
    const sessionId = await getSessionId();
    if (sessionId === null) {
        const newSessionId = await createSessionIdEdge();
        await setSessionId(newSessionId);
        return newSessionId;
    }
    return sessionId;
}

export async function resetSessionId() {
    const cookieStore = cookies();
    const sessionId = cookieStore.get("session-id")?.value;
    if (sessionId) {
        await deleteCart(sessionId);
    }
    cookieStore.delete("session-id");
    await setSessionId(await createSessionIdEdge());
}

