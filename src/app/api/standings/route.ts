import { NextRequest, NextResponse } from "next/server";
import { getStandings } from "@/lib/providers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const leagueParam = searchParams.get("league") || "39";

    const data = await getStandings(leagueParam);

    return NextResponse.json(
      {
        success: true,
        data,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
        },
      }
    );
  } catch (error: any) {
    console.error("[API Standings Route Error]:", error);
    return NextResponse.json(
      { error: "Failed to retrieve standings", details: error?.message },
      { status: 500 }
    );
  }
}
