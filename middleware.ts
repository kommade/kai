import { NextRequest, NextResponse } from "next/server";
import { createSessionIdEdge } from "./functions/sessions-edge";
import { ifLoggedInGetUser } from "./functions/auth";
import { SignJWT } from "jose";

const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET as string);

// Rule 1: Check session
async function checkSession(request: NextRequest) {
    let session = request.cookies.get("session-id");
    if (!session) {
        const created = await createSessionIdEdge();
        const response = NextResponse.next();
        const jwt = new SignJWT({ created }).setProtectedHeader({ alg: "HS256" }).setExpirationTime(process.env.NODE_ENV === "test" ? "10s" : "1h");
        response.cookies.set({
            name: "session-id",
            value: await jwt.sign(jwtSecret),
            httpOnly: process.env.NODE_ENV === "production",
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });
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
            url.pathname = `/login`
            url.searchParams.set("redirect", request.nextUrl.pathname)
            return NextResponse.redirect(url, { status: 302 });
        }
    }
    return null;
}

export async function middleware(request: NextRequest) {
    return await checkAdminAccess(request) ?? await checkSession(request) ?? NextResponse.next();
}