"use server";

import { cookies } from "next/headers";
import { deleteCart } from "./database";
import { createSessionIdEdge } from "./sessions-edge";
import { setSessionId } from "./sessions-edge";

export type SessionId = string;

export async function getSessionId() {
    const session = cookies().get("session-id")?.value;
    if (session === undefined) {
        return null;
    }
    return decodeURI(session);
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

