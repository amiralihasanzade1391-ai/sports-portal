"use client";

import { useState } from "react";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { fetcher } from "@/lib/fetcher";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingTable } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable, type Column } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { formatDate, getInitials } from "@/lib/utils";
import { Users, RefreshCw, ShieldAlert, ShieldCheck, User } from "lucide-react";

interface UserItem {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: "USER" | "ADMIN";
  createdAt: string;
  _count?: {
    comments: number;
    favoriteTeams: number;
    articles: number;
  };
}

interface UsersApiResponse {
  success: boolean;
  data: UserItem[];
  total: number;
  page: number;
  pageSize: number;
}

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  const currentUserEmail = session?.user?.email;

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  // Deletion state
  const [userToDelete, setUserToDelete] = useState<UserItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Construct SWR query
  const queryParams = new URLSearchParams({
    pageSize: "50",
    ...(roleFilter !== "ALL" ? { role: roleFilter } : {}),
    ...(search.trim() ? { search: search.trim() } : {}),
  });

  const apiUrl = `/api/users?${queryParams.toString()}`;

  const { data, error, isLoading, isValidating, mutate } =
    useSWR<UsersApiResponse>(apiUrl, fetcher, {
      revalidateOnFocus: false,
    });

  const users = data?.data || [];

  const isCurrentUser = (u: UserItem): boolean => {
    return Boolean(
      (currentUserId && u.id === currentUserId) ||
      (currentUserEmail && u.email === currentUserEmail)
    );
  };

  // ─── 1-Click Role Toggle with Self-Demotion Safeguard ───────────────────────
  const handleToggleRole = async (user: UserItem) => {
    // CRITICAL SAFEGUARD: Current admin cannot demote themselves
    if (isCurrentUser(user)) {
      toast({
        title: "Action Denied",
        description: "You cannot change or demote your own administrator role.",
        variant: "destructive",
      });
      return;
    }

    const nextRole = user.role === "ADMIN" ? "USER" : "ADMIN";
    const previousData = data;

    // 1. Optimistic UI update
    mutate(
      (current) =>
        current
          ? {
              ...current,
              data: current.data.map((u) =>
                u.id === user.id ? { ...u, role: nextRole } : u
              ),
            }
          : current,
      false
    );

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: nextRole }),
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to update role");
      }

      toast({
        title: "Role Updated",
        description: `${user.name || user.email} is now an ${nextRole}.`,
      });

      // 2. Revalidate
      mutate();
    } catch (err: any) {
      // 3. Rollback
      mutate(previousData, false);
      toast({
        title: "Role Update Failed",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  // ─── Optimistic User Deletion with Self-Deletion Safeguard ───────────────────
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    if (isCurrentUser(userToDelete)) {
      toast({
        title: "Security Safeguard",
        description: "You cannot delete your own active administrator account.",
        variant: "destructive",
      });
      setUserToDelete(null);
      return;
    }

    setIsDeleting(true);
    const previousData = data;
    const item = userToDelete;

    // 1. Optimistic UI update
    mutate(
      (current) =>
        current
          ? {
              ...current,
              data: current.data.filter((u) => u.id !== item.id),
              total: Math.max(0, current.total - 1),
            }
          : current,
      false
    );

    try {
      const res = await fetch(`/api/users/${item.id}`, { method: "DELETE" });
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to delete user");
      }

      toast({
        title: "User Removed",
        description: `Account for ${item.name || item.email} was removed.`,
      });
      setUserToDelete(null);
      mutate();
    } catch (err: any) {
      mutate(previousData, false);
      toast({
        title: "Deletion Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setUserToDelete(null);
    }
  };

  const columns: Column<UserItem>[] = [
    {
      header: "Member Profile",
      accessorKey: (item) => {
        const isSelf = isCurrentUser(item);
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border">
              <AvatarImage src={item.image || undefined} />
              <AvatarFallback className="text-xs font-bold">
                {getInitials(item.name || item.email)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm leading-tight">
                  {item.name || "Anonymous Fan"}
                </span>
                {isSelf && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary text-primary font-bold">
                    You
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{item.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      header: "Role",
      accessorKey: (item) => (
        <Badge
          variant={item.role === "ADMIN" ? "default" : "secondary"}
          className="text-xs font-semibold gap-1"
        >
          {item.role === "ADMIN" ? (
            <ShieldCheck className="h-3 w-3" />
          ) : (
            <User className="h-3 w-3" />
          )}
          {item.role}
        </Badge>
      ),
    },
    {
      header: "Engagement",
      accessorKey: (item) => (
        <span className="text-xs text-muted-foreground">
          {item._count?.comments ?? 0} comments • {item._count?.favoriteTeams ?? 0} clubs
        </span>
      ),
    },
    {
      header: "Joined Date",
      accessorKey: (item) => (
        <span className="text-xs text-muted-foreground font-mono">
          {formatDate(item.createdAt)}
        </span>
      ),
    },
    {
      header: "Quick Role Toggle",
      accessorKey: (item) => {
        const isSelf = isCurrentUser(item);
        return (
          <Button
            size="sm"
            variant="outline"
            disabled={isSelf}
            onClick={() => handleToggleRole(item)}
            className="h-7 text-xs font-medium"
            title={isSelf ? "You cannot modify your own role" : `Switch to ${item.role === "ADMIN" ? "USER" : "ADMIN"}`}
          >
            {isSelf ? "Locked (Self)" : `Switch to ${item.role === "ADMIN" ? "USER" : "ADMIN"}`}
          </Button>
        );
      },
    },
  ];

  const adminCount = users.filter((u) => u.role === "ADMIN").length;
  const userCount = users.filter((u) => u.role === "USER").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Accounts & Permissions"
        description="Inspect registered members, promote trusted fans to ADMIN privileges, and manage account security with built-in self-protection safeguards."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Users" },
        ]}
        action={
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
        }
      />

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border bg-card/60 flex flex-col">
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Members</span>
          <span className="text-2xl font-black text-foreground">{users.length}</span>
        </div>
        <div className="p-3.5 rounded-xl border bg-card/60 flex flex-col">
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Administrators</span>
          <span className="text-2xl font-black text-primary">{adminCount}</span>
        </div>
        <div className="p-3.5 rounded-xl border bg-card/60 flex flex-col">
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Regular Fans</span>
          <span className="text-2xl font-black text-foreground">{userCount}</span>
        </div>
        <div className="p-3.5 rounded-xl border bg-card/60 flex flex-col">
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Comments Authored</span>
          <span className="text-2xl font-black text-emerald-500">
            {users.reduce((acc, u) => acc + (u._count?.comments ?? 0), 0)}
          </span>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl border bg-card">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {["ALL", "ADMIN", "USER"].map((r) => (
            <Button
              key={r}
              size="sm"
              variant={roleFilter === r ? "default" : "outline"}
              onClick={() => setRoleFilter(r)}
              className="text-xs h-8 rounded-full"
            >
              {r === "ALL" ? "All Accounts" : r === "ADMIN" ? "Administrators" : "Regular Users"}
            </Button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Input
            placeholder="Search by name or email..."
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
          <p className="font-semibold text-sm">Failed to load user accounts from database.</p>
          <p className="text-xs text-muted-foreground">{error.message}</p>
          <Button size="sm" variant="outline" onClick={() => mutate()}>
            Try Again
          </Button>
        </div>
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users found"
          description={
            search || roleFilter !== "ALL"
              ? "No accounts match your current query or role filter."
              : "No registered accounts discovered in the database."
          }
          actionLabel="Reset Search"
          onAction={() => {
            setSearch("");
            setRoleFilter("ALL");
          }}
        />
      ) : (
        <DataTable
          columns={columns}
          data={users}
          onDelete={(user) => {
            if (isCurrentUser(user)) {
              toast({
                title: "Security Safeguard",
                description: "You cannot delete your own active administrator account.",
                variant: "destructive",
              });
              return;
            }
            setUserToDelete(user);
          }}
        />
      )}

      {/* Confirm Delete User Dialog */}
      <ConfirmDialog
        open={!!userToDelete}
        onOpenChange={(open) => !open && setUserToDelete(null)}
        title={`Revoke user account for "${userToDelete?.name || userToDelete?.email}"?`}
        description="Are you sure you want to delete this user? All their posted comments and preferences will be permanently wiped."
        confirmLabel="Revoke Account"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
