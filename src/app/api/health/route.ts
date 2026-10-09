import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getProviderHealth } from "@/lib/providers";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  const checks: Record<string, { status: "healthy" | "degraded" | "down"; latencyMs?: number; error?: string }> = {};

  // 1. Database Health Check
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    checks.database = {
      status: "healthy",
      latencyMs: Date.now() - dbStart,
    };
  } catch (err: any) {
    checks.database = {
      status: "down",
      error: err?.message || "Database connection error",
    };
  }

  // 2. Multi-Sport Provider Configuration Check
  const hasBzzoiro = Boolean(process.env.BZZOIRO_API_KEY);
  const hasFootballData = Boolean(process.env.FOOTBALL_DATA_TOKEN);
  const hasFootballCharts = Boolean(process.env.FOOTBALL_CHARTS_API_KEY);

  checks.providers = {
    status: hasFootballData && hasBzzoiro ? "healthy" : "degraded",
    error: !(hasFootballData && hasBzzoiro) ? "Some provider keys missing" : undefined,
  };

  const providerHealth = getProviderHealth();
  const isAllHealthy = checks.database.status === "healthy" && checks.providers.status === "healthy";
  const overallStatus = isAllHealthy ? "ok" : checks.database.status === "down" ? "unhealthy" : "degraded";

  return NextResponse.json(
    {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      totalLatencyMs: Date.now() - startTime,
      environment: process.env.NODE_ENV || "development",
      checks,
      providerHealth,
    },
    {
      status: overallStatus === "unhealthy" ? 503 : 200,
    }
  );
}
