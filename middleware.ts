import { NextRequest, NextResponse } from "next/server";
import { createSessionIdEdge } from "./functions/sessions-edge";
import { ifLoggedInGetUser } from "./functions/auth";

// Rule 1: Check session
async function checkSession(request: NextRequest) {
    let session = request.cookies.get("session-id");
    if (!session) {
        const created = await createSessionIdEdge();
        const response = NextResponse.next();
        response.cookies.set({ name: "session-id", value: created, expires: process.env.NODE_ENV === "test" ? new Date(Date.now() + 10000) : new Date(Date.now() + 1000 * 60 * 60) });
        return response;
    }
    return null;
}

// Rule 2: Another rule
async function checkAdminAccess(request: NextRequest) {
    if (request.nextUrl.pathname.startsWith("/dashboard")) {
        const auth = await ifLoggedInGetUser();
        const url = request.nextUrl.clone()
        if (auth.loggedIn && auth.user.role === "admin") {
            return null;
        } else if (auth.loggedIn) {
            url.pathname = '/'
            return NextResponse.redirect(url, { status: 302 });
        } else {
            url.pathname = '/login'
            return NextResponse.redirect(url, { status: 302 });
        }
    }
    return null;
}

export async function middleware(request: NextRequest) {
    let response = NextResponse.next();
    response = await checkSession(request) ?? response;
    response = await checkAdminAccess(request) ?? response;
    return response;
}