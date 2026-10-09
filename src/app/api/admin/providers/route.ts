import { NextResponse } from "next/server";
import { getProviderHealth } from "@/lib/providers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const health = getProviderHealth();

    const providerConfigs = [
      {
        name: "Bzzoiro Sports Data",
        role: "Primary Football Provider",
        endpoint: "https://sports.bzzoiro.com/api/v2/",
        isConfigured: !!process.env.BZZOIRO_API_KEY,
        priority: 1,
        tier: "Primary Live",
      },
      {
        name: "football-data.org",
        role: "Secondary Football Provider",
        endpoint: "https://api.football-data.org/v4",
        isConfigured: !!(process.env.FOOTBALL_DATA_ORG_KEY || process.env.FOOTBALL_DATA_KEY),
        priority: 2,
        tier: "Standings & Secondary",
      },
      {
        name: "footballdata.io",
        role: "Tertiary Football Provider",
        endpoint: "https://footballdata.io/api/v1",
        isConfigured: !!process.env.FOOTBALLDATA_IO_KEY,
        priority: 3,
        tier: "Tertiary Failover",
      },
      {
        name: "football-charts.com",
        role: "Specialist Predictions Engine",
        endpoint: "https://footballcharts-backend.onrender.com/api/v1",
        isConfigured: !!process.env.FOOTBALL_CHARTS_API_KEY,
        priority: 4,
        tier: "Predictive Analytics",
      },
      {
        name: "TheSportsDB",
        role: "Specialist Media & Logos",
        endpoint: "https://www.thesportsdb.com/api/v1/json/3",
        isConfigured: true, // open/public tier
        priority: 5,
        tier: "Static Media Assets",
      },
      {
        name: "balldontlie.io",
        role: "NBA Basketball Multi-Sport",
        endpoint: "https://api.balldontlie.io/v1",
        isConfigured: !!process.env.BALLDONTLIE_API_KEY,
        priority: 6,
        tier: "Multi-Sport Primary",
      },
    ];

    const data = providerConfigs.map((cfg) => {
      const h = health.find((item) => item.name === cfg.name);

      return {
        ...cfg,
        circuitStatus: h ? h.status : "ONLINE",
        failures: h ? h.failures : 0,
        lastFailure: h?.lastFailure || null,
        circuitPolicy: "3 failures in 5m trips OPEN for 10m",
      };
    });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      providers: data,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to query provider telemetry" },
      { status: 500 }
    );
  }
}
