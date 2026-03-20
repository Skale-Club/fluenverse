import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if it's an admin route
    if (pathname.startsWith("/admin")) {
        const authCookie = request.cookies.get("fluenverse_admin_auth");
        const roleCookie = request.cookies.get("fluenverse_user_role");
        const normalizedRole = (roleCookie?.value || "").toLowerCase();

        // Not authenticated -> login
        if (authCookie?.value !== "1") {
            return NextResponse.redirect(new URL("/login", request.url));
        }

        // Not an Admin -> back to home
        if (normalizedRole !== "admin") {
            return NextResponse.redirect(new URL("/", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: "/admin/:path*"
};
