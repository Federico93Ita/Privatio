import { NextRequest } from "next/server";
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

// Next.js 15+/16 requires route handlers to accept (req, context) with
// context.params as a Promise. next-auth v4 doesn't support this natively,
// so we wrap the handler to ensure compatibility.
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ nextauth: string[] }> }
) {
  // Await params to satisfy Next.js 16 requirements
  await context.params;
  return handler(req, context as never);
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ nextauth: string[] }> }
) {
  await context.params;
  return handler(req, context as never);
}
