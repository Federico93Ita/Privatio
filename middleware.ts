import { withAuth } from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

/* ─── Maintenance / Coming-Soon gate ─── */
const MAINTENANCE_MODE = process.env.MAINTENANCE_MODE === "true";
const MAINTENANCE_SECRET = process.env.MAINTENANCE_SECRET;

/* ─── Protected route patterns ─── */
const PROTECTED_PATTERNS = [
  "/dashboard/",
  "/admin",
  "/api/dashboard/",
  "/api/admin/",
];

function isProtectedRoute(pathname: string) {
  return PROTECTED_PATTERNS.some((p) => pathname.startsWith(p));
}

export async function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  /* ── 1. Maintenance mode (if enabled) ── */
  if (MAINTENANCE_MODE) {
    // Always allow: coming-soon, static, api, favicon
    const isExempt =
      pathname === "/coming-soon" ||
      pathname.startsWith("/_next") ||
      pathname.startsWith("/api/") ||
      pathname === "/favicon.ico" ||
      pathname.startsWith("/images/");

    if (!isExempt) {
      // ?access=SECRET → set cookie & continue (only if secret is configured)
      if (MAINTENANCE_SECRET && searchParams.get("access") === MAINTENANCE_SECRET) {
        const res = NextResponse.redirect(new URL(pathname, req.url));
        res.cookies.set("privatio_access", MAINTENANCE_SECRET, {
          httpOnly: true,
          secure: true,
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 30, // 30 days
        });
        return res;
      }

      // Valid cookie → allow (only if secret is configured)
      if (!MAINTENANCE_SECRET || req.cookies.get("privatio_access")?.value !== MAINTENANCE_SECRET) {
        // Everyone else → coming soon
        return NextResponse.rewrite(new URL("/coming-soon", req.url));
      }
    }
  }

  /* ── 2. Auth guard (protected routes only) ── */
  if (isProtectedRoute(pathname)) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.redirect(new URL("/accedi", req.url));
    }

    // Admin routes: require ADMIN role
    if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
      if (token.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/accedi", req.url));
      }
    }

    // Agency dashboard
    if (
      pathname.startsWith("/dashboard/agenzia") ||
      pathname.startsWith("/api/dashboard/agency")
    ) {
      if (
        token.role !== "AGENCY_ADMIN" &&
        token.role !== "AGENCY_AGENT" &&
        token.role !== "ADMIN"
      ) {
        return NextResponse.redirect(new URL("/accedi", req.url));
      }
    }

    // Seller dashboard
    if (
      pathname.startsWith("/dashboard/venditore") ||
      pathname.startsWith("/api/dashboard/seller")
    ) {
      if (token.role !== "SELLER" && token.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/accedi", req.url));
      }
    }

    // Buyer dashboard
    if (
      pathname.startsWith("/dashboard/acquirente") ||
      pathname.startsWith("/api/dashboard/buyer")
    ) {
      if (token.role !== "BUYER" && token.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/accedi", req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except static files and Next internals.
     * This allows both maintenance gate and auth guard to run.
     */
    "/((?!_next/static|_next/image|favicon.ico|images/).*)",
  ],
};
