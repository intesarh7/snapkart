import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function proxy(req: NextRequest) {
  const token = req.cookies.get("snapkart_token")?.value;
  const { pathname } = req.nextUrl;

  // ✅ ADD THIS BLOCK (User route protection without token)
  if (!token) {
    if (
      pathname.startsWith("/admin") ||
      pathname.startsWith("/delivery") ||
      pathname.startsWith("/user")
    ) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET as string
    );

    const { payload }: any = await jwtVerify(token, secret);

    // Admin route protection
    if (pathname.startsWith("/admin") && payload.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Delivery route protection
    if (pathname.startsWith("/delivery") && payload.role !== "DELIVERY") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // ✅ ADD THIS BLOCK (User role protection)
    if (pathname.startsWith("/user") && payload.role !== "USER") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();

  } catch (err) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/delivery/:path*",
    "/user/:path*", // ✅ ADD THIS
  ],
};
