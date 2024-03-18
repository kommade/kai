"use server";

import { cookies } from "next/headers";
import { changeCartId, createCart, deleteCart, getCart } from "./database";

type SessionId = string;

export async function getSessionId() {
    const session = cookies().get("session-id")?.value;
    if (session === undefined) {
        throw new Error("Session ID not found");
    }
    return decodeURI(session);
}

export async function setSessionId(sessionId: SessionId) {
    const cookieStore = cookies();
    cookieStore.set("session-id", sessionId);
}

export async function createSessionIdEdge() {
    const newSessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);;
    await createCart(newSessionId);
    return newSessionId;
}

export async function sessionIsActive() {
    return typeof await getSessionId() === "string";
}

export async function sessionIsExpired() {
    const sessionId = await getSessionId();
    if (sessionId) {
        return await getCart(sessionId) === null;
    } else {
        return false;
    }
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

export async function changeSessionId(newSessionId: SessionId) {
    const oldSessionId = await getSessionId();
    if (oldSessionId) {
        await changeCartId(oldSessionId, newSessionId);
    } else { // actually this should never happen
        await createCart(newSessionId);
    }
    setSessionId(newSessionId);
}
