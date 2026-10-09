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
import { UserCheck, Plus, RefreshCw, Loader2, ArrowUpDown, User } from "lucide-react";

interface PlayerItem {
  id: string;
  name: string;
  teamId: string;
  position: string;
  number?: number | null;
  nationality: string;
  image: string;
  goals: number;
  assists: number;
  appearances: number;
  team?: {
    id: string;
    name: string;
    shortName: string;
    logo: string;
    league?: string;
  };
}

interface PlayersApiResponse {
  success: boolean;
  data: PlayerItem[];
  total: number;
  page: number;
  pageSize: number;
}

interface TeamsApiResponse {
  success: boolean;
  data: Array<{ id: string; name: string; shortName: string; logo: string }>;
}

const POSITIONS = ["Goalkeeper", "Defender", "Midfielder", "Forward", "Winger", "Striker"];

export default function AdminPlayersPage() {
  const [search, setSearch] = useState("");
  const [positionFilter, setPositionFilter] = useState("ALL");
  const [selectedTeamFilter, setSelectedTeamFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("goals"); // goals | assists | appearances | name

  // Create / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<PlayerItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [teamId, setTeamId] = useState("");
  const [position, setPosition] = useState("Forward");
  const [number, setNumber] = useState<string>("9");
  const [nationality, setNationality] = useState("England");
  const [image, setImage] = useState(
    "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=400&auto=format&fit=crop&q=60"
  );
  const [goals, setGoals] = useState<string>("0");
  const [assists, setAssists] = useState<string>("0");
  const [appearances, setAppearances] = useState<string>("0");

  // Delete Confirmation state
  const [playerToDelete, setPlayerToDelete] = useState<PlayerItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Construct SWR query
  const queryParams = new URLSearchParams({
    pageSize: "50",
    sortBy,
    ...(positionFilter !== "ALL" ? { position: positionFilter } : {}),
    ...(selectedTeamFilter !== "ALL" ? { teamId: selectedTeamFilter } : {}),
    ...(search.trim() ? { search: search.trim() } : {}),
  });

  const apiUrl = `/api/players?${queryParams.toString()}`;

  const { data, error, isLoading, isValidating, mutate } =
    useSWR<PlayersApiResponse>(apiUrl, fetcher, {
      revalidateOnFocus: false,
    });

  // Dynamically fetch registered teams for dropdowns
  const { data: teamsData } = useSWR<TeamsApiResponse>("/api/teams?pageSize=100", fetcher);
  const teams = teamsData?.data || [];
  const players = data?.data || [];

  const openCreateModal = () => {
    setEditingPlayer(null);
    setName("");
    setTeamId(teams[0]?.id || "");
    setPosition("Forward");
    setNumber("9");
    setNationality("England");
    setImage("https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=400&auto=format&fit=crop&q=60");
    setGoals("0");
    setAssists("0");
    setAppearances("0");
    setIsModalOpen(true);
  };

  const openEditModal = (player: PlayerItem) => {
    setEditingPlayer(player);
    setName(player.name);
    setTeamId(player.teamId);
    setPosition(player.position);
    setNumber(player.number ? player.number.toString() : "");
    setNationality(player.nationality);
    setImage(player.image);
    setGoals(player.goals.toString());
    setAssists(player.assists.toString());
    setAppearances(player.appearances.toString());
    setIsModalOpen(true);
  };

  // ─── Save Player (Create or Update) ─────────────────────────────────────────
  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !teamId) {
      toast({
        title: "Validation Error",
        description: "Player name and club affiliation are required.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const payload = {
      name: name.trim(),
      teamId,
      position,
      number: number ? parseInt(number, 10) : null,
      nationality: nationality.trim(),
      image: image.trim(),
      goals: parseInt(goals, 10) || 0,
      assists: parseInt(assists, 10) || 0,
      appearances: parseInt(appearances, 10) || 0,
    };

    try {
      if (editingPlayer) {
        // Edit Mode (PUT)
        const res = await fetch(`/api/players/${editingPlayer.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const result = await res.json();
        if (!res.ok || !result.success) throw new Error(result.error || "Update failed");

        toast({
          title: "Player Updated",
          description: `"${name}" roster information saved.`,
        });
      } else {
        // Create Mode (POST)
        const res = await fetch("/api/players", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const result = await res.json();
        if (!res.ok || !result.success) throw new Error(result.error || "Creation failed");

        toast({
          title: "Player Registered",
          description: `"${name}" added to team roster.`,
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

  // ─── Optimistic Delete Player ───────────────────────────────────────────────
  const handleConfirmDelete = async () => {
    if (!playerToDelete) return;
    setIsDeleting(true);
    const previousData = data;
    const item = playerToDelete;

    // 1. Optimistic UI update
    mutate(
      (current) =>
        current
          ? {
              ...current,
              data: current.data.filter((p) => p.id !== item.id),
              total: Math.max(0, current.total - 1),
            }
          : current,
      false
    );

    try {
      const res = await fetch(`/api/players/${item.id}`, { method: "DELETE" });
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to delete player");
      }

      toast({
        title: "Player Removed",
        description: `"${item.name}" has been removed from the roster.`,
      });
      setPlayerToDelete(null);
      mutate();
    } catch (err: any) {
      // Rollback on failure
      mutate(previousData, false);
      toast({
        title: "Delete Failed",
        description: err.message || "Failed to delete player.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setPlayerToDelete(null);
    }
  };

  const columns: Column<PlayerItem>[] = [
    {
      header: "Athlete",
      accessorKey: (item) => (
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-full bg-muted border overflow-hidden shrink-0 flex items-center justify-center">
            {item.image ? (
              <Image
                src={item.image}
                alt={item.name}
                width={36}
                height={36}
                unoptimized
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm leading-tight">{item.name}</span>
              {item.number != null && (
                <span className="text-xs font-mono text-muted-foreground">#{item.number}</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{item.nationality}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Club",
      accessorKey: (item) => (
        <div className="flex items-center gap-1.5 text-xs font-medium">
          <span>{item.team?.logo || "⚽"}</span>
          <span>{item.team?.name || "Unassigned"}</span>
        </div>
      ),
    },
    {
      header: "Position",
      accessorKey: (item) => <Badge variant="secondary" className="text-xs">{item.position}</Badge>,
    },
    {
      header: "Goals",
      accessorKey: (item) => (
        <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
          {item.goals}
        </span>
      ),
    },
    {
      header: "Assists",
      accessorKey: (item) => (
        <span className="font-extrabold text-sm text-blue-600 dark:text-blue-400">
          {item.assists}
        </span>
      ),
    },
    {
      header: "Apps",
      accessorKey: (item) => (
        <span className="text-xs text-muted-foreground font-mono">{item.appearances}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Players & Athletes"
        description="Maintain official rosters, player portraits, transfer assignments, and live scoring statistics."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Players" },
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
              Add Player
            </Button>
          </div>
        }
      />

      {/* KPI Stats Overview Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border bg-card/60 flex flex-col">
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Registered Roster</span>
          <span className="text-2xl font-black text-foreground">{players.length}</span>
        </div>
        <div className="p-3.5 rounded-xl border bg-card/60 flex flex-col">
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Goals</span>
          <span className="text-2xl font-black text-emerald-500">
            {players.reduce((acc, p) => acc + p.goals, 0)}
          </span>
        </div>
        <div className="p-3.5 rounded-xl border bg-card/60 flex flex-col">
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Assists</span>
          <span className="text-2xl font-black text-blue-500">
            {players.reduce((acc, p) => acc + p.assists, 0)}
          </span>
        </div>
        <div className="p-3.5 rounded-xl border bg-card/60 flex flex-col">
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Appearances</span>
          <span className="text-2xl font-black text-foreground">
            {players.reduce((acc, p) => acc + p.appearances, 0)}
          </span>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 rounded-xl border bg-card">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <Button
            size="sm"
            variant={positionFilter === "ALL" ? "default" : "outline"}
            onClick={() => setPositionFilter("ALL")}
            className="text-xs h-8 rounded-full"
          >
            All Positions
          </Button>
          {POSITIONS.map((pos) => (
            <Button
              key={pos}
              size="sm"
              variant={positionFilter === pos ? "default" : "outline"}
              onClick={() => setPositionFilter(pos)}
              className="text-xs h-8 rounded-full shrink-0"
            >
              {pos}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Sort By Selector */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-36 h-8 text-xs">
              <ArrowUpDown className="h-3 w-3 mr-1" />
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="goals">Most Goals</SelectItem>
              <SelectItem value="assists">Most Assists</SelectItem>
              <SelectItem value="appearances">Most Appearances</SelectItem>
              <SelectItem value="name">Name (A-Z)</SelectItem>
            </SelectContent>
          </Select>

          {/* Club Filter */}
          <Select value={selectedTeamFilter} onValueChange={setSelectedTeamFilter}>
            <SelectTrigger className="w-40 h-8 text-xs">
              <SelectValue placeholder="Filter Team" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Teams</SelectItem>
              {teams.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.logo} {t.shortName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Search Box */}
          <Input
            placeholder="Search athlete..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 text-xs w-44"
          />
        </div>
      </div>

      {/* Table / Loading / Empty State */}
      {isLoading ? (
        <LoadingTable rows={6} />
      ) : error ? (
        <div className="p-8 text-center rounded-xl border border-destructive/20 bg-destructive/5 text-destructive space-y-2">
          <p className="font-semibold text-sm">Failed to load players from database.</p>
          <p className="text-xs text-muted-foreground">{error.message}</p>
          <Button size="sm" variant="outline" onClick={() => mutate()}>
            Try Again
          </Button>
        </div>
      ) : players.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="No athletes found"
          description={
            search || positionFilter !== "ALL" || selectedTeamFilter !== "ALL"
              ? "No players match your active search query or filters."
              : "No athletes registered in the database yet. Click Add Player to recruit your first player!"
          }
          actionLabel={search || positionFilter !== "ALL" ? "Reset Filters" : "Add Player"}
          onAction={
            search || positionFilter !== "ALL"
              ? () => {
                  setSearch("");
                  setPositionFilter("ALL");
                  setSelectedTeamFilter("ALL");
                }
              : openCreateModal
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={players}
          onEdit={openEditModal}
          onDelete={(player) => setPlayerToDelete(player)}
        />
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={!!playerToDelete}
        onOpenChange={(open) => !open && setPlayerToDelete(null)}
        title={`Remove "${playerToDelete?.name}"?`}
        description="Are you sure you want to remove this athlete from the system? Their historic scoring statistics will also be deleted."
        confirmLabel="Remove Player"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
      />

      {/* Create / Edit Player Modal with Live Portrait Preview & Smart Team Select */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingPlayer ? "Edit Athlete Details" : "Enroll New Player"}</DialogTitle>
            <DialogDescription>
              {editingPlayer
                ? `Update properties and club transfers for ${editingPlayer.name}.`
                : "Register a player, assign squad number, and initialize stats."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="playerName">Full Name</Label>
                <Input
                  id="playerName"
                  placeholder="e.g. Erling Haaland"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="squadNumber">Squad #</Label>
                <Input
                  id="squadNumber"
                  type="number"
                  placeholder="9"
                  min={1}
                  max={99}
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                />
              </div>
            </div>

            {/* Smart Team Dropdown */}
            <div className="space-y-1.5">
              <Label htmlFor="teamId">Club Affiliation</Label>
              <Select value={teamId} onValueChange={setTeamId}>
                <SelectTrigger id="teamId">
                  <SelectValue placeholder="Select Club" />
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
                <Label htmlFor="position">Position</Label>
                <Select value={position} onValueChange={setPosition}>
                  <SelectTrigger id="position">
                    <SelectValue placeholder="Select Position" />
                  </SelectTrigger>
                  <SelectContent>
                    {POSITIONS.map((pos) => (
                      <SelectItem key={pos} value={pos}>
                        {pos}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="nationality">Nationality</Label>
                <Input
                  id="nationality"
                  placeholder="e.g. Norway"
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Live Portrait Image Preview Box */}
            <div className="space-y-2">
              <Label htmlFor="playerImage">Portrait Photo URL</Label>
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-full border-2 border-primary/30 bg-muted/60 flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
                  {image ? (
                    <Image
                      src={image}
                      alt="Player Preview"
                      width={56}
                      height={56}
                      unoptimized
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>

                <div className="flex-1">
                  <Input
                    id="playerImage"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Numeric Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="goals">Goals</Label>
                <Input
                  id="goals"
                  type="number"
                  min={0}
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="assists">Assists</Label>
                <Input
                  id="assists"
                  type="number"
                  min={0}
                  value={assists}
                  onChange={(e) => setAssists(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="appearances">Appearances</Label>
                <Input
                  id="appearances"
                  type="number"
                  min={0}
                  value={appearances}
                  onChange={(e) => setAppearances(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingPlayer ? "Save Changes" : "Register Athlete"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
