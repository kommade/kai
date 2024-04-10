"use server";

import { cookies } from "next/headers";
import { changeCartId, createCartEdge } from "./database-edge";

export async function createSessionIdEdge() {
    const newSessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);;
    await createCartEdge(newSessionId, false);
    return newSessionId;
}

export async function setSessionId(sessionId: string, user: boolean = false) {
    const cookieStore = cookies();
    cookieStore.set({ name: "session-id", value: sessionId, expires: process.env.NODE_ENV === "test" ? new Date(Date.now() + 10000) : user ? new Date(Date.now() + 1000 * 60 * 60 * 24) : new Date(Date.now() + 1000 * 60 * 60) });
    createCartEdge(sessionId, user);
}
export async function getSessionId() {
    const session = cookies().get("session-id")?.value;
    if (session === undefined) {
        return null;
    }
    return decodeURI(session);
}
export async function changeSessionIdAfterLogin(newSessionId: string) {
    const oldSessionId = await getSessionId();
    if (oldSessionId) {
        await changeCartId(oldSessionId, newSessionId);
    }
    setSessionId(newSessionId, true);
}

