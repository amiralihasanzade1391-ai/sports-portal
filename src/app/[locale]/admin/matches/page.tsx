"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingTable } from "@/components/shared/loading-skeleton";
import { DataTable, type Column } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import { Loader2, Plus, RefreshCw } from "lucide-react";

interface MatchItem {
  id: string;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  minute: number | null;
  league: string;
  matchDate: string;
  venue: string | null;
  homeTeam: {
    id: string;
    name: string;
    shortName: string;
    logo: string;
  };
  awayTeam: {
    id: string;
    name: string;
    shortName: string;
    logo: string;
  };
}

interface MatchesApiResponse {
  success: boolean;
  data: MatchItem[];
  total: number;
  page: number;
  pageSize: number;
}

interface TeamsApiResponse {
  success: boolean;
  data: Array<{ id: string; name: string; shortName: string; logo: string }>;
}

export default function AdminMatchesPage() {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [leagueSearch, setLeagueSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states for creating a new match
  const [homeTeamId, setHomeTeamId] = useState("");
  const [awayTeamId, setAwayTeamId] = useState("");
  const [league, setLeague] = useState("Premier League");
  const [venue, setVenue] = useState("");
  const [matchDate, setMatchDate] = useState("");
  const [matchStatus, setMatchStatus] = useState("NOT_STARTED");

  // Construct query string for SWR key
  const queryParams = new URLSearchParams({
    pageSize: "50",
    ...(statusFilter !== "ALL" ? { status: statusFilter } : {}),
    ...(leagueSearch.trim() ? { league: leagueSearch.trim() } : {}),
  });

  const apiUrl = `/api/matches?${queryParams.toString()}`;

  const { data, error, isLoading, isValidating, mutate } =
    useSWR<MatchesApiResponse>(apiUrl, fetcher, {
      revalidateOnFocus: false,
    });

  // Fetch available teams for the create dialog
  const { data: teamsData } = useSWR<TeamsApiResponse>(
    isCreateOpen ? "/api/teams?pageSize=100" : null,
    fetcher
  );

  const matches = data?.data || [];
  const teams = teamsData?.data || [];

  // ─── Optimistic Delete ──────────────────────────────────────────────────────
  const handleDelete = async (item: MatchItem) => {
    const previousData = data;

    // 1. Optimistic UI update
    mutate(
      (current) =>
        current
          ? {
              ...current,
              data: current.data.filter((m) => m.id !== item.id),
              total: Math.max(0, current.total - 1),
            }
          : current,
      false
    );

    try {
      const res = await fetch(`/api/matches/${item.id}`, { method: "DELETE" });
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to delete match");
      }

      toast({
        title: "Match Deleted",
        description: `Fixture ${item.homeTeam.shortName} vs ${item.awayTeam.shortName} removed.`,
      });

      // 2. Revalidate
      mutate();
    } catch (err: any) {
      // 3. Rollback
      mutate(previousData, false);
      toast({
        title: "Delete Failed",
        description: err.message || "Could not delete match on server.",
        variant: "destructive",
      });
    }
  };

  // ─── Create New Match ───────────────────────────────────────────────────────
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeTeamId || !awayTeamId) {
      toast({
        title: "Validation Error",
        description: "Please select both home and away teams.",
        variant: "destructive",
      });
      return;
    }

    if (homeTeamId === awayTeamId) {
      toast({
        title: "Invalid Opponents",
        description: "Home and away teams cannot be the same.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedDate = matchDate
        ? new Date(matchDate).toISOString()
        : new Date().toISOString();

      const res = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          homeTeamId,
          awayTeamId,
          league: league.trim(),
          venue: venue.trim() || undefined,
          matchDate: formattedDate,
          status: matchStatus,
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to schedule match");
      }

      toast({
        title: "Match Scheduled!",
        description: "The new match fixture has been created.",
      });

      // Reset form
      setHomeTeamId("");
      setAwayTeamId("");
      setVenue("");
      setIsCreateOpen(false);

      // Revalidate
      mutate();
    } catch (err: any) {
      toast({
        title: "Scheduling Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<MatchItem>[] = [
    {
      header: "Match",
      accessorKey: (item) => (
        <div className="font-semibold text-sm flex items-center gap-1.5">
          <span>{item.homeTeam.logo}</span>
          <span>{item.homeTeam.shortName}</span>
          <span className="text-muted-foreground font-light text-xs">vs</span>
          <span>{item.awayTeam.logo}</span>
          <span>{item.awayTeam.shortName}</span>
        </div>
      ),
    },
    {
      header: "Score",
      accessorKey: (item) => (
        <span className="font-bold text-sm text-primary">
          {item.homeScore !== null && item.awayScore !== null
            ? `${item.homeScore} - ${item.awayScore}`
            : "—"}
        </span>
      ),
    },
    {
      header: "League",
      accessorKey: (item) => (
        <span className="text-xs text-muted-foreground">{item.league}</span>
      ),
    },
    {
      header: "Status",
      accessorKey: (item) => {
        if (
          item.status === "FIRST_HALF" ||
          item.status === "SECOND_HALF" ||
          item.status === "HALF_TIME"
        ) {
          return (
            <Badge variant="live" className="text-[10px] px-2">
              LIVE {item.minute ? `• ${item.minute}'` : ""}
            </Badge>
          );
        }
        if (item.status === "FINISHED") {
          return (
            <Badge variant="secondary" className="text-[10px]">
              FINISHED
            </Badge>
          );
        }
        return (
          <Badge variant="outline" className="text-[10px]">
            UPCOMING
          </Badge>
        );
      },
    },
    {
      header: "Date",
      accessorKey: (item) => (
        <span className="text-xs text-muted-foreground">
          {formatDate(item.matchDate)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Matches & Fixtures"
        description="Real-time match schedule management with SWR caching, status filtering, and optimistic delete actions."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Matches" },
        ]}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => mutate()}
              disabled={isValidating}
              className="gap-1.5"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isValidating ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={() => setIsCreateOpen(true)}
              className="gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Schedule Match
            </Button>
          </div>
        }
      />

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl border bg-card">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {["ALL", "LIVE", "UPCOMING", "FINISHED"].map((st) => (
            <Button
              key={st}
              size="sm"
              variant={statusFilter === st ? "default" : "outline"}
              onClick={() => setStatusFilter(st)}
              className="text-xs h-8 rounded-full"
            >
              {st}
            </Button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Input
            placeholder="Search by league..."
            value={leagueSearch}
            onChange={(e) => setLeagueSearch(e.target.value)}
            className="h-8 text-xs"
          />
        </div>
      </div>

      {/* Main Content Table or SWR Loading Skeleton */}
      {isLoading ? (
        <LoadingTable rows={6} />
      ) : error ? (
        <div className="p-8 text-center rounded-xl border border-destructive/20 bg-destructive/5 text-destructive space-y-2">
          <p className="font-semibold text-sm">Failed to load matches from API.</p>
          <p className="text-xs text-muted-foreground">{error.message}</p>
          <Button size="sm" variant="outline" onClick={() => mutate()}>
            Try Again
          </Button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={matches}
          onDelete={handleDelete}
        />
      )}

      {/* Schedule Match Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule New Match</DialogTitle>
            <DialogDescription>
              Create a new match fixture between registered clubs.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="homeTeam">Home Team</Label>
              <Select value={homeTeamId} onValueChange={setHomeTeamId}>
                <SelectTrigger id="homeTeam">
                  <SelectValue placeholder="Select Home Team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.logo} {t.name} ({t.shortName})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="awayTeam">Away Team</Label>
              <Select value={awayTeamId} onValueChange={setAwayTeamId}>
                <SelectTrigger id="awayTeam">
                  <SelectValue placeholder="Select Away Team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.logo} {t.name} ({t.shortName})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="leagueName">League / Tournament</Label>
                <Input
                  id="leagueName"
                  value={league}
                  onChange={(e) => setLeague(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="matchStatus">Initial Status</Label>
                <Select value={matchStatus} onValueChange={setMatchStatus}>
                  <SelectTrigger id="matchStatus">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NOT_STARTED">Upcoming</SelectItem>
                    <SelectItem value="FIRST_HALF">Live (1st Half)</SelectItem>
                    <SelectItem value="FINISHED">Finished</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="venue">Venue / Stadium</Label>
              <Input
                id="venue"
                placeholder="e.g. Wembley Stadium"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="matchDate">Match Date & Time</Label>
              <Input
                id="matchDate"
                type="datetime-local"
                value={matchDate}
                onChange={(e) => setMatchDate(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Schedule Match
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
