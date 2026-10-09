"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingGrid } from "@/components/shared/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Star, Plus, Search, Check, Heart, Shield, RefreshCw } from "lucide-react";

interface FavoriteEntry {
  id: string;
  userId: string;
  teamId: string;
  createdAt: string;
  team: {
    id: string;
    name: string;
    shortName: string;
    logo: string;
    league: string;
    country: string;
    stadium?: string | null;
  };
}

interface TeamDirectoryItem {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  league: string;
  country: string;
}

export function FavoriteTeams() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [teamSearchQuery, setTeamSearchQuery] = useState("");
  const [selectedLeague, setSelectedLeague] = useState("ALL");

  // Fetch user's saved favorite teams
  const {
    data: favoritesData,
    isLoading: isFavsLoading,
    isValidating,
    mutate: mutateFavorites,
  } = useSWR<{ success: boolean; data: FavoriteEntry[] }>(
    userId ? `/api/users/${userId}/favorites` : null,
    fetcher
  );

  // Fetch all registered teams for search/autocomplete
  const { data: allTeamsData } = useSWR<{ success: boolean; data: TeamDirectoryItem[] }>(
    "/api/teams?pageSize=100",
    fetcher
  );

  const favoriteEntries = favoritesData?.data || [];
  const allTeams = allTeamsData?.data || [];

  // Set of followed team IDs for fast O(1) lookup
  const followedTeamIds = new Set(favoriteEntries.map((f) => f.teamId));

  // Filtered teams for autocomplete search modal
  const filteredSearchTeams = allTeams.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(teamSearchQuery.toLowerCase()) ||
      t.shortName.toLowerCase().includes(teamSearchQuery.toLowerCase()) ||
      t.league.toLowerCase().includes(teamSearchQuery.toLowerCase());
    const matchesLeague = selectedLeague === "ALL" || t.league === selectedLeague;
    return matchesSearch && matchesLeague;
  });

  // Distinct leagues
  const distinctLeagues = Array.from(new Set(allTeams.map((t) => t.league).filter(Boolean)));

  // ─── Follow Team (Optimistic) ───────────────────────────────────────────────
  const handleFollowTeam = async (team: TeamDirectoryItem) => {
    if (!userId) return;
    const previousData = favoritesData;

    // Optimistically add to list
    const optimisticEntry: FavoriteEntry = {
      id: `temp-${Date.now()}`,
      userId,
      teamId: team.id,
      createdAt: new Date().toISOString(),
      team,
    };

    mutateFavorites(
      (current) =>
        current ? { ...current, data: [optimisticEntry, ...current.data] } : current,
      false
    );

    try {
      const res = await fetch(`/api/users/${userId}/favorites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId: team.id }),
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to follow team");
      }

      toast({
        title: `Following ${team.name}`,
        description: "Club added to your personalized feeds and score tickers.",
      });

      mutateFavorites();
    } catch (err: any) {
      mutateFavorites(previousData, false);
      toast({
        title: "Action Failed",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  // ─── Unfollow Team (Optimistic) ─────────────────────────────────────────────
  const handleUnfollowTeam = async (teamId: string, teamName: string) => {
    if (!userId) return;
    const previousData = favoritesData;

    // Optimistic removal
    mutateFavorites(
      (current) =>
        current
          ? { ...current, data: current.data.filter((f) => f.teamId !== teamId) }
          : current,
      false
    );

    try {
      const res = await fetch(`/api/users/${userId}/favorites?teamId=${teamId}`, {
        method: "DELETE",
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to unfollow team");
      }

      toast({
        title: `Unfollowed ${teamName}`,
        description: "Club removed from your favorites.",
      });

      mutateFavorites();
    } catch (err: any) {
      mutateFavorites(previousData, false);
      toast({
        title: "Action Failed",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border bg-card shadow-xs">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle>My Followed Clubs</CardTitle>
            <CardDescription>
              Prioritize scores, match notifications, and news coverage for your favorite organizations.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1 px-3 py-1 text-primary border-primary/30">
              <Star className="h-3.5 w-3.5 fill-primary text-primary" />
              {favoriteEntries.length} Clubs
            </Badge>
            <Button
              size="sm"
              onClick={() => setIsSearchModalOpen(true)}
              className="gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Follow Club
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isFavsLoading ? (
            <LoadingGrid count={4} />
          ) : favoriteEntries.length === 0 ? (
            <EmptyState
              icon={Shield}
              title="No favorite clubs followed yet"
              description="Pick your favorite football, basketball, and world clubs to tailor your personalized schedule and live scores."
              actionLabel="Search & Follow Clubs"
              onAction={() => setIsSearchModalOpen(true)}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {favoriteEntries.map(({ team }) => (
                <div
                  key={team.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border bg-primary/5 border-primary/30 shadow-2xs hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{team.logo}</span>
                    <div>
                      <h4 className="font-bold text-sm leading-tight">{team.name}</h4>
                      <span className="text-xs text-muted-foreground">{team.league}</span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUnfollowTeam(team.id, team.name)}
                    className="h-8 px-2.5 text-xs gap-1 hover:border-destructive hover:text-destructive transition-colors"
                  >
                    <Check className="h-3.5 w-3.5 text-primary" />
                    Following
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Suggested & Trending Clubs (Senior Product Engineer Enhancement) */}
      <Card className="border bg-card shadow-xs">
        <CardHeader>
          <CardTitle>Suggested Clubs to Follow</CardTitle>
          <CardDescription>
            Popular clubs from top world competitions. Click to follow in 1-click.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {allTeams.slice(0, 6).map((team) => {
              const isFollowing = followedTeamIds.has(team.id);
              return (
                <div
                  key={team.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card/60 hover:bg-muted/30 transition-all text-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{team.logo}</span>
                    <div>
                      <p className="font-bold text-xs">{team.name}</p>
                      <p className="text-[11px] text-muted-foreground">{team.league}</p>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant={isFollowing ? "secondary" : "outline"}
                    onClick={() =>
                      isFollowing
                        ? handleUnfollowTeam(team.id, team.name)
                        : handleFollowTeam(team)
                    }
                    className="h-7 text-xs px-2 gap-1"
                  >
                    {isFollowing ? (
                      <>
                        <Check className="h-3 w-3" />
                        Following
                      </>
                    ) : (
                      <>
                        <Heart className="h-3 w-3" />
                        Follow
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Searchable Team Select Autocomplete Modal Dialog */}
      <Dialog open={isSearchModalOpen} onOpenChange={setIsSearchModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Search & Follow Clubs</DialogTitle>
            <DialogDescription>
              Find clubs by name, code, or league competition to personalize your dashboard.
            </DialogDescription>
          </DialogHeader>

          {/* Autocomplete Search Input */}
          <div className="space-y-3 py-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Type to search e.g. Arsenal, Real Madrid, Premier League..."
                value={teamSearchQuery}
                onChange={(e) => setTeamSearchQuery(e.target.value)}
                className="pl-9 h-10"
                autoFocus
              />
            </div>

            {/* League Quick Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-1">
              <Button
                size="sm"
                variant={selectedLeague === "ALL" ? "default" : "outline"}
                onClick={() => setSelectedLeague("ALL")}
                className="text-xs h-7 rounded-full"
              >
                All
              </Button>
              {distinctLeagues.map((lg) => (
                <Button
                  key={lg}
                  size="sm"
                  variant={selectedLeague === lg ? "default" : "outline"}
                  onClick={() => setSelectedLeague(lg)}
                  className="text-xs h-7 rounded-full shrink-0"
                >
                  {lg}
                </Button>
              ))}
            </div>

            {/* Results Autocomplete List */}
            <div className="max-h-72 overflow-y-auto space-y-2 border rounded-xl p-2 bg-muted/10">
              {filteredSearchTeams.length === 0 ? (
                <p className="text-center text-xs text-muted-foreground py-8">
                  No clubs found matching &ldquo;{teamSearchQuery}&rdquo;.
                </p>
              ) : (
                filteredSearchTeams.map((team) => {
                  const isFollowing = followedTeamIds.has(team.id);
                  return (
                    <div
                      key={team.id}
                      className="flex items-center justify-between p-2.5 rounded-lg border bg-card hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{team.logo}</span>
                        <div>
                          <p className="font-bold text-sm leading-tight">{team.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {team.shortName} • {team.league}
                          </p>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant={isFollowing ? "secondary" : "default"}
                        onClick={() =>
                          isFollowing
                            ? handleUnfollowTeam(team.id, team.name)
                            : handleFollowTeam(team)
                        }
                        className="h-8 text-xs gap-1.5"
                      >
                        {isFollowing ? (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            Following
                          </>
                        ) : (
                          <>
                            <Heart className="h-3.5 w-3.5" />
                            Follow
                          </>
                        )}
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
