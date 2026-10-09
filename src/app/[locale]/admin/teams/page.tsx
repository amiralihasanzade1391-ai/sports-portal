"use client";

import { useState } from "react";
import Image from "next/image";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingTable } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable, type Column } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Shield, Plus, RefreshCw, Loader2, Image as ImageIcon } from "lucide-react";

interface TeamItem {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  league: string;
  country: string;
  founded?: number | null;
  stadium?: string | null;
  _count?: {
    players: number;
    homeMatches: number;
    awayMatches: number;
  };
}

interface TeamsApiResponse {
  success: boolean;
  data: TeamItem[];
  total: number;
  page: number;
  pageSize: number;
}

const EMOJI_BADGE_PRESETS = ["🔴", "🔵", "⚪", "🟡", "⚫", "🟢", "🟣", "🟠", "🦁", "🦅", "⚽", "🏆"];

export default function AdminTeamsPage() {
  const [search, setSearch] = useState("");
  const [leagueFilter, setLeagueFilter] = useState("ALL");

  // Create / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<TeamItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [logo, setLogo] = useState("🔴");
  const [league, setLeague] = useState("Premier League");
  const [country, setCountry] = useState("England");
  const [stadium, setStadium] = useState("");
  const [founded, setFounded] = useState<string>("1900");

  // Delete Confirmation state
  const [teamToDelete, setTeamToDelete] = useState<TeamItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Construct SWR query
  const queryParams = new URLSearchParams({
    pageSize: "100",
    ...(leagueFilter !== "ALL" ? { league: leagueFilter } : {}),
    ...(search.trim() ? { search: search.trim() } : {}),
  });

  const apiUrl = `/api/teams?${queryParams.toString()}`;

  const { data, error, isLoading, isValidating, mutate } =
    useSWR<TeamsApiResponse>(apiUrl, fetcher, {
      revalidateOnFocus: false,
    });

  const teams = data?.data || [];

  // Distinct leagues for filter pills
  const distinctLeagues = Array.from(
    new Set(teams.map((t) => t.league).filter(Boolean))
  );

  const openCreateModal = () => {
    setEditingTeam(null);
    setName("");
    setShortName("");
    setLogo("🔴");
    setLeague("Premier League");
    setCountry("England");
    setStadium("");
    setFounded("1900");
    setIsModalOpen(true);
  };

  const openEditModal = (team: TeamItem) => {
    setEditingTeam(team);
    setName(team.name);
    setShortName(team.shortName);
    setLogo(team.logo);
    setLeague(team.league);
    setCountry(team.country);
    setStadium(team.stadium || "");
    setFounded(team.founded ? team.founded.toString() : "");
    setIsModalOpen(true);
  };

  // ─── Save Team (Create or Update) ───────────────────────────────────────────
  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !shortName.trim()) {
      toast({
        title: "Validation Error",
        description: "Team name and short code are required.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const payload = {
      name: name.trim(),
      shortName: shortName.trim().toUpperCase(),
      logo: logo.trim() || "⚽",
      league: league.trim(),
      country: country.trim(),
      stadium: stadium.trim() || null,
      founded: founded ? parseInt(founded, 10) : null,
    };

    try {
      if (editingTeam) {
        // Edit Mode (PUT)
        const res = await fetch(`/api/teams/${editingTeam.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const result = await res.json();
        if (!res.ok || !result.success) throw new Error(result.error || "Update failed");

        toast({
          title: "Team Updated",
          description: `"${name}" details have been updated successfully.`,
        });
      } else {
        // Create Mode (POST)
        const res = await fetch("/api/teams", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const result = await res.json();
        if (!res.ok || !result.success) throw new Error(result.error || "Creation failed");

        toast({
          title: "Team Created",
          description: `"${name}" has been registered successfully.`,
        });
      }

      setIsModalOpen(false);
      mutate();
    } catch (err: any) {
      toast({
        title: "Operation Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Optimistic Delete Team ─────────────────────────────────────────────────
  const handleConfirmDelete = async () => {
    if (!teamToDelete) return;
    setIsDeleting(true);
    const previousData = data;
    const item = teamToDelete;

    // 1. Optimistic UI update
    mutate(
      (current) =>
        current
          ? {
              ...current,
              data: current.data.filter((t) => t.id !== item.id),
              total: Math.max(0, current.total - 1),
            }
          : current,
      false
    );

    try {
      const res = await fetch(`/api/teams/${item.id}`, { method: "DELETE" });
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to delete team");
      }

      toast({
        title: "Team Deleted",
        description: `"${item.name}" has been removed from the directory.`,
      });
      setTeamToDelete(null);
      mutate();
    } catch (err: any) {
      // Rollback on failure
      mutate(previousData, false);
      toast({
        title: "Delete Failed",
        description: err.message || "Failed to delete team.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setTeamToDelete(null);
    }
  };

  const isUrlLogo = logo.startsWith("http://") || logo.startsWith("https://") || logo.startsWith("/");

  const columns: Column<TeamItem>[] = [
    {
      header: "Club",
      accessorKey: (item) => (
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-muted border flex items-center justify-center text-lg overflow-hidden shrink-0">
            {item.logo.startsWith("http") || item.logo.startsWith("/") ? (
              <Image
                src={item.logo}
                alt={item.name}
                width={32}
                height={32}
                unoptimized
                className="h-full w-full object-contain p-0.5"
              />
            ) : (
              <span>{item.logo}</span>
            )}
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">{item.name}</p>
            <p className="text-xs text-muted-foreground">{item.stadium || item.country}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Code",
      accessorKey: (item) => <Badge variant="secondary" className="font-mono text-xs">{item.shortName}</Badge>,
    },
    {
      header: "League",
      accessorKey: (item) => <span className="text-xs font-medium">{item.league}</span>,
    },
    {
      header: "Country",
      accessorKey: (item) => <span className="text-xs text-muted-foreground">{item.country}</span>,
    },
    {
      header: "Roster",
      accessorKey: (item) => (
        <Badge variant="outline" className="text-xs">
          {item._count?.players ?? 0} Players
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Teams & Clubs"
        description="Comprehensive sports organization directory with live logo previews, roster counts, and optimistic CRUD actions."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Teams" },
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
              <RefreshCw className={`h-3.5 w-3.5 ${isValidating ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button size="sm" onClick={openCreateModal} className="gap-1.5">
              <Plus className="h-4 w-4" />
              Add Team
            </Button>
          </div>
        }
      />

      {/* KPI Summary Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border bg-card/60 flex flex-col">
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Clubs</span>
          <span className="text-2xl font-black text-foreground">{teams.length}</span>
        </div>
        <div className="p-3.5 rounded-xl border bg-card/60 flex flex-col">
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Leagues</span>
          <span className="text-2xl font-black text-foreground">{distinctLeagues.length || 1}</span>
        </div>
        <div className="p-3.5 rounded-xl border bg-card/60 flex flex-col">
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Athletes</span>
          <span className="text-2xl font-black text-foreground">
            {teams.reduce((acc, t) => acc + (t._count?.players ?? 0), 0)}
          </span>
        </div>
        <div className="p-3.5 rounded-xl border bg-card/60 flex flex-col">
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Scheduled Fixtures</span>
          <span className="text-2xl font-black text-foreground">
            {teams.reduce((acc, t) => acc + (t._count?.homeMatches ?? 0), 0)}
          </span>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl border bg-card">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <Button
            size="sm"
            variant={leagueFilter === "ALL" ? "default" : "outline"}
            onClick={() => setLeagueFilter("ALL")}
            className="text-xs h-8 rounded-full"
          >
            All Leagues
          </Button>
          {distinctLeagues.map((lg) => (
            <Button
              key={lg}
              size="sm"
              variant={leagueFilter === lg ? "default" : "outline"}
              onClick={() => setLeagueFilter(lg)}
              className="text-xs h-8 rounded-full shrink-0"
            >
              {lg}
            </Button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Input
            placeholder="Search club name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 text-xs"
          />
        </div>
      </div>

      {/* Table / Loading / Empty State */}
      {isLoading ? (
        <LoadingTable rows={6} />
      ) : error ? (
        <div className="p-8 text-center rounded-xl border border-destructive/20 bg-destructive/5 text-destructive space-y-2">
          <p className="font-semibold text-sm">Failed to load teams from database.</p>
          <p className="text-xs text-muted-foreground">{error.message}</p>
          <Button size="sm" variant="outline" onClick={() => mutate()}>
            Try Again
          </Button>
        </div>
      ) : teams.length === 0 ? (
        <EmptyState
          icon={Shield}
          title="No teams found"
          description={
            search || leagueFilter !== "ALL"
              ? "No clubs match your current search query or league filters."
              : "No sports clubs registered in the system yet. Add your first team!"
          }
          actionLabel={search || leagueFilter !== "ALL" ? "Reset Filters" : "Add Team"}
          onAction={
            search || leagueFilter !== "ALL"
              ? () => {
                  setSearch("");
                  setLeagueFilter("ALL");
                }
              : openCreateModal
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={teams}
          onEdit={openEditModal}
          onDelete={(team) => setTeamToDelete(team)}
        />
      )}

      {/* Reusable Confirmation Dialog for Deletions */}
      <ConfirmDialog
        open={!!teamToDelete}
        onOpenChange={(open) => !open && setTeamToDelete(null)}
        title={`Delete "${teamToDelete?.name}"?`}
        description="Are you sure you want to delete this club? This action will cascade to players associated with this team and cannot be undone."
        confirmLabel="Delete Team"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
      />

      {/* Create / Edit Team Modal with Live Logo Preview */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingTeam ? "Edit Club Details" : "Register New Club"}</DialogTitle>
            <DialogDescription>
              {editingTeam
                ? `Update properties for ${editingTeam.name}.`
                : "Add a sports organization, badge, and venue parameters."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="teamName">Club Name</Label>
                <Input
                  id="teamName"
                  placeholder="e.g. Real Madrid CF"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!shortName && e.target.value.length >= 3) {
                      setShortName(e.target.value.slice(0, 3).toUpperCase());
                    }
                  }}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="shortName">Code (3-5 Letters)</Label>
                <Input
                  id="shortName"
                  placeholder="RMA"
                  maxLength={5}
                  value={shortName}
                  onChange={(e) => setShortName(e.target.value.toUpperCase())}
                  required
                />
              </div>
            </div>

            {/* Logo Input with Live Interactive Preview */}
            <div className="space-y-2">
              <Label htmlFor="teamLogo">Club Logo / Crest (Emoji or Image URL)</Label>
              <div className="flex items-center gap-3">
                {/* Live Preview Box */}
                <div className="h-12 w-12 rounded-xl border-2 border-primary/30 bg-muted/60 flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
                  {isUrlLogo ? (
                    <Image
                      src={logo}
                      alt="Logo Preview"
                      width={48}
                      height={48}
                      unoptimized
                      className="h-full w-full object-contain p-1"
                    />
                  ) : (
                    <span className="text-2xl">{logo || "⚽"}</span>
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <Input
                    id="teamLogo"
                    placeholder="Enter emoji or image URL (https://...)"
                    value={logo}
                    onChange={(e) => setLogo(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Quick Preset Emoji Badges */}
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[11px] text-muted-foreground mr-1">Quick badges:</span>
                {EMOJI_BADGE_PRESETS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setLogo(emoji)}
                    className="h-6 w-6 rounded border hover:bg-accent text-sm flex items-center justify-center transition-transform hover:scale-110"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="league">League / Competition</Label>
                <Input
                  id="league"
                  placeholder="e.g. La Liga"
                  value={league}
                  onChange={(e) => setLeague(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  placeholder="e.g. Spain"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="stadium">Home Stadium</Label>
                <Input
                  id="stadium"
                  placeholder="e.g. Santiago Bernabéu"
                  value={stadium}
                  onChange={(e) => setStadium(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="founded">Founded Year</Label>
                <Input
                  id="founded"
                  type="number"
                  placeholder="1902"
                  value={founded}
                  onChange={(e) => setFounded(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingTeam ? "Save Changes" : "Create Club"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
