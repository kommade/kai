"use server";

import { cookies } from "next/headers";
import { deleteCart } from "./database";

type SessionId = string;

export async function getSessionId() {
    const cookieStore = cookies();
    return cookieStore.get("session-id")?.value;
}

function setSessionId(sessionId: SessionId, expires?: Date) {
    const cookieStore = cookies();
    cookieStore.set("session-id", sessionId, { expires });
}

export async function getSessionIdAndCreateIfMissing() {
    const sessionId = await getSessionId();
    if (!sessionId) {
        const newSessionId = crypto.randomUUID();
        setSessionId(newSessionId);
        return newSessionId;
    }

    return sessionId;
}

export async function clearSessionId() {
    const cookieStore = cookies();
    const sessionId = cookieStore.get("session-id")?.value;
    cookieStore.delete("session-id");
    if (sessionId) {
        await deleteCart(sessionId);
    }
}

export async function refreshSessionId() {
    clearSessionId();
    return getSessionIdAndCreateIfMissing();
}
