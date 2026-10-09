"use client";

import { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

export interface LiveMatch {
  id: string;
  homeTeam: {
    id?: string;
    name: string;
    shortName?: string;
    logo?: string;
  };
  awayTeam: {
    id?: string;
    name: string;
    shortName?: string;
    logo?: string;
  };
  homeScore: number | null;
  awayScore: number | null;
  status: "FIRST_HALF" | "SECOND_HALF" | "HALF_TIME" | "LIVE" | "FINISHED" | string;
  minute: number | null;
  matchDate?: string;
  league: string;
  venue?: string;
}

interface ApiResponse {
  success: boolean;
  data: LiveMatch[];
  total: number;
}

export function useLiveMatches(options?: { refreshInterval?: number }) {
  const refreshInterval = options?.refreshInterval ?? 30000; // 30s polling by default

  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [isRecentRefresh, setIsRecentRefresh] = useState(false);
  const [minuteChangedMap, setMinuteChangedMap] = useState<Record<string, boolean>>({});

  const previousMinutesRef = useRef<Record<string, number>>({});

  const { data, error, isLoading, mutate } = useSWR<ApiResponse>(
    "/api/matches?status=LIVE",
    fetcher,
    {
      refreshInterval,
      revalidateOnFocus: true,
      dedupingInterval: 5000,
      onSuccess: (newData) => {
        const now = new Date();
        setLastRefreshed(now);
        setIsRecentRefresh(true);

        // Detect minute increments for micro-animations
        if (newData?.data && Array.isArray(newData.data)) {
          const changed: Record<string, boolean> = {};
          newData.data.forEach((m) => {
            const prev = previousMinutesRef.current[m.id];
            if (m.minute !== null && prev !== undefined && prev !== m.minute) {
              changed[m.id] = true;
            }
            if (m.minute !== null) {
              previousMinutesRef.current[m.id] = m.minute;
            }
          });

          if (Object.keys(changed).length > 0) {
            setMinuteChangedMap((prev) => ({ ...prev, ...changed }));
            // Reset the animation flag after 2.5 seconds
            setTimeout(() => {
              setMinuteChangedMap((prev) => {
                const updated = { ...prev };
                Object.keys(changed).forEach((k) => delete updated[k]);
                return updated;
              });
            }, 2500);
          }
        }
      },
    }
  );

  // Expire the "isRecentRefresh" indicator after 60 seconds of no fresh data
  useEffect(() => {
    if (!lastRefreshed) return;
    const timer = setTimeout(() => {
      setIsRecentRefresh(false);
    }, 60000);
    return () => clearTimeout(timer);
  }, [lastRefreshed]);

  const matches = data?.data || [];
  const hasLiveMatches = matches.length > 0;

  return {
    matches,
    total: data?.total ?? matches.length,
    hasLiveMatches,
    isLoading,
    error,
    lastRefreshed,
    isRecentRefresh,
    minuteChangedMap,
    refreshNow: mutate,
  };
}
