import { NextRequest, NextResponse } from "next/server";
import { createSessionIdEdge } from "./functions/sessions";


export async function middleware(request: NextRequest) {
    let session = request.cookies.get("session-id");
    if (!session) {
        const created = await createSessionIdEdge();
        const response = NextResponse.next();
        response.cookies.set("session-id", created)
        return response;
    }
    return NextResponse.next();
}