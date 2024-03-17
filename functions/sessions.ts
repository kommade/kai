"use server";

import { cookies } from "next/headers";
import { createCart, deleteCart, getCart } from "./database";

type SessionId = string;

export async function getSessionId() {
    const cookieStore = cookies();
    return cookieStore.get("session-id")?.value;
}

function setSessionId(sessionId: SessionId) {
    const cookieStore = cookies();
    cookieStore.set("session-id", sessionId);
}

export async function getSessionIdAndCreateIfMissing() {
    const sessionId = await getSessionId();
    if (!sessionId) {
        const newSessionId = crypto.randomUUID();
        setSessionId(newSessionId);
        createCart(newSessionId);
        return newSessionId;
    }
    return sessionId;
}

export async function sessionIsActive() {
    return typeof await getSessionId() === "string";
}

export async function sessionIsExpired() {
    const cookieStore = cookies();
    const sessionId = cookieStore.get("session-id")?.value;
    if (sessionId) {
        return await getCart(sessionId) === null;
    } else {
        return false;
    }
}

export async function clearSessionId() {
    const cookieStore = cookies();
    const sessionId = cookieStore.get("session-id")?.value;
    cookieStore.delete("session-id");
    if (sessionId) {
        await deleteCart(sessionId);
    }
}
