"use server";

import { cookies } from "next/headers";

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
        return newSessionId;
    }

    return sessionId;
}
