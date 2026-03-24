import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Admin routes: require ADMIN role
    if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
      if (token?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/accedi", req.url));
      }
    }

    // Agency dashboard: require AGENCY_ADMIN or AGENCY_AGENT
    if (
      pathname.startsWith("/dashboard/agenzia") ||
      pathname.startsWith("/api/dashboard/agency")
    ) {
      if (
        token?.role !== "AGENCY_ADMIN" &&
        token?.role !== "AGENCY_AGENT" &&
        token?.role !== "ADMIN"
      ) {
        return NextResponse.redirect(new URL("/accedi", req.url));
      }
    }

    // Seller dashboard: require SELLER (or ADMIN)
    if (
      pathname.startsWith("/dashboard/venditore") ||
      pathname.startsWith("/api/dashboard/seller")
    ) {
      if (token?.role !== "SELLER" && token?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/accedi", req.url));
      }
    }

    // Buyer dashboard: require BUYER (or ADMIN)
    if (
      pathname.startsWith("/dashboard/acquirente") ||
      pathname.startsWith("/api/dashboard/buyer")
    ) {
      if (token?.role !== "BUYER" && token?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/accedi", req.url));
      }
    }

    const response = NextResponse.next();

    // Security headers
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );
    response.headers.set(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=(self)"
    );

    return response;
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/accedi",
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/api/dashboard/:path*",
    "/api/admin/:path*",
  ],
};
