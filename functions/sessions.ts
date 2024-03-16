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
    cookieStore.set("active-session", "true");
}

export async function getSessionIdAndCreateIfMissing() {
    if (await sessionIsExpired()) {
        await clearSessionId();
    }
    const activeSession = cookies().get("active-session")?.value;
    if (activeSession === "true") {
        return cookies().get("session-id")!.value;
    } else {
        const sessionId = crypto.randomUUID();
        setSessionId(sessionId, new Date(Date.now() + 1000 * 60 * 60));
        return sessionId;
    }
}

export async function extendSessionId() {
    const sessionId = await getSessionId();
    if (sessionId) {
        setSessionId(sessionId, new Date(Date.now() + 1000 * 60 * 60));
    } else {
        throw new Error("No session id found");
    }
}

export async function sessionIsActive() {
    const activeSession = cookies().get("active-session")?.value;
    return activeSession === "true";
}

export async function sessionIsExpired() {
    const cookieStore = cookies();
    const sessionId = cookieStore.get("session-id")?.value;
    const activeSession = cookieStore.get("active-session")?.value;
    if (!sessionId && activeSession === "true") {
        return true;
    }
    return false;
}

export async function clearSessionId() {
    const cookieStore = cookies();
    const sessionId = cookieStore.get("session-id")?.value;
    cookieStore.delete("session-id");
    cookieStore.set("active-session", "false");
    if (sessionId) {
        await deleteCart(sessionId);
    }
}
