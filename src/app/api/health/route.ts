import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateEnv } from "@/lib/env";

/**
 * GET /api/health — Health check endpoint for monitoring and deployment.
 * Checks: database connectivity, env vars, memory usage.
 */
export async function GET() {
  const checks: Record<string, { status: string; message?: string }> = {};
  let healthy = true;

  // 1. Environment variables
  const envResult = validateEnv();
  checks.env = envResult.valid
    ? { status: "ok" }
    : { status: "warn", message: `Missing: ${envResult.missing.join(", ")}` };

  // 2. Database connectivity
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { status: "ok" };
  } catch (error) {
    checks.database = {
      status: "error",
      message: error instanceof Error ? error.message : "Connection failed",
    };
    healthy = false;
  }

  // 3. Memory usage
  const mem = process.memoryUsage();
  const heapUsedMB = Math.round(mem.heapUsed / 1024 / 1024);
  const heapTotalMB = Math.round(mem.heapTotal / 1024 / 1024);
  checks.memory = {
    status: heapUsedMB > 450 ? "warn" : "ok",
    message: `${heapUsedMB}MB / ${heapTotalMB}MB`,
  };

  const response = {
    status: healthy ? "healthy" : "unhealthy",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "0.1.0",
    uptime: Math.round(process.uptime()),
    checks,
  };

  return NextResponse.json(response, {
    status: healthy ? 200 : 503,
  });
}
