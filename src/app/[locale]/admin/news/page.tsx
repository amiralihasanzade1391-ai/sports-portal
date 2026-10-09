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
import { Textarea } from "@/components/ui/textarea";
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

interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  coverImage: string;
  published: boolean;
  createdAt: string;
  author?: {
    id: string;
    name: string | null;
  };
  _count?: {
    comments: number;
  };
}

interface NewsApiResponse {
  success: boolean;
  data: ArticleItem[];
  total: number;
  page: number;
  pageSize: number;
}

export default function AdminNewsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleRssSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/news/sync", { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to sync RSS feeds");
      }
      toast({
        title: "News Synced Successfully",
        description: `${json.imported} new articles imported (${json.skipped} existing skipped).`,
      });
      mutate();
    } catch (err: any) {
      toast({
        title: "Sync Error",
        description: err.message || "Failed to sync RSS news feeds.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Form state for creating a new article
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newExcerpt, setNewExcerpt] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("FOOTBALL");
  const [newCoverImage, setNewCoverImage] = useState(
    "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=60"
  );
  const [newPublished, setNewPublished] = useState(true);

  // Construct query string for SWR key
  const queryParams = new URLSearchParams({
    all: "true",
    pageSize: "50",
    ...(category !== "ALL" ? { category } : {}),
    ...(search.trim() ? { search: search.trim() } : {}),
  });

  const apiUrl = `/api/news?${queryParams.toString()}`;

  const { data, error, isLoading, isValidating, mutate } =
    useSWR<NewsApiResponse>(apiUrl, fetcher, {
      revalidateOnFocus: false,
    });

  const articles = data?.data || [];

  // ─── Optimistic Delete ──────────────────────────────────────────────────────
  const handleDelete = async (item: ArticleItem) => {
    const previousData = data;

    // 1. Instantly update UI (optimistic)
    mutate(
      (current) =>
        current
          ? {
              ...current,
              data: current.data.filter((a) => a.id !== item.id),
              total: Math.max(0, current.total - 1),
            }
          : current,
      false
    );

    try {
      const res = await fetch(`/api/news/${item.id}`, { method: "DELETE" });
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to delete article");
      }

      toast({
        title: "Article Deleted",
        description: `"${item.title}" has been deleted.`,
      });

      // 2. Revalidate to ensure sync
      mutate();
    } catch (err: any) {
      // 3. Rollback UI on error
      mutate(previousData, false);
      toast({
        title: "Deletion Failed",
        description: err.message || "Could not delete article from server.",
        variant: "destructive",
      });
    }
  };

  // ─── Optimistic Publish / Draft Toggle ──────────────────────────────────────
  const handleTogglePublish = async (item: ArticleItem) => {
    const nextPublished = !item.published;
    const previousData = data;

    // 1. Optimistic UI update
    mutate(
      (current) =>
        current
          ? {
              ...current,
              data: current.data.map((a) =>
                a.id === item.id ? { ...a, published: nextPublished } : a
              ),
            }
          : current,
      false
    );

    try {
      const res = await fetch(`/api/news/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: nextPublished }),
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to update article status");
      }

      toast({
        title: "Status Updated",
        description: `Article is now ${nextPublished ? "Published" : "Draft"}.`,
      });

      // 2. Revalidate with server
      mutate();
    } catch (err: any) {
      // 3. Rollback
      mutate(previousData, false);
      toast({
        title: "Update Failed",
        description: err.message || "Failed to update status on server.",
        variant: "destructive",
      });
    }
  };

  // ─── Handle Create Article ──────────────────────────────────────────────────
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSlug.trim()) {
      toast({
        title: "Validation Error",
        description: "Title and slug are required.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          slug: newSlug.trim().toLowerCase(),
          excerpt:
            newExcerpt.trim() ||
            "Detailed sports coverage and analytical breakdown.",
          content:
            newContent.trim() ||
            "Comprehensive in-depth match coverage and analysis from our sports newsroom.",
          category: newCategory,
          coverImage: newCoverImage.trim(),
          published: newPublished,
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to create article");
      }

      toast({
        title: "Article Created!",
        description: `"${newTitle}" was added to the database.`,
      });

      // Reset form
      setNewTitle("");
      setNewSlug("");
      setNewExcerpt("");
      setNewContent("");
      setIsCreateOpen(false);

      // Revalidate SWR data
      mutate();
    } catch (err: any) {
      toast({
        title: "Creation Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<ArticleItem>[] = [
    {
      header: "Title",
      accessorKey: (item) => (
        <div className="space-y-0.5">
          <p className="font-semibold text-sm line-clamp-1">{item.title}</p>
          <p className="text-xs text-muted-foreground font-mono">/{item.slug}</p>
        </div>
      ),
    },
    {
      header: "Category",
      accessorKey: (item) => <Badge variant="outline">{item.category}</Badge>,
    },
    {
      header: "Author",
      accessorKey: (item) => (
        <span className="text-xs text-muted-foreground">
          {item.author?.name || "Sports Staff"}
        </span>
      ),
    },
    {
      header: "Status",
      accessorKey: (item) => (
        <Button
          size="sm"
          variant={item.published ? "secondary" : "outline"}
          onClick={() => handleTogglePublish(item)}
          className="h-6 text-xs px-2 font-medium"
        >
          {item.published ? "Published" : "Draft"}
        </Button>
      ),
    },
    {
      header: "Date",
      accessorKey: (item) => (
        <span className="text-xs text-muted-foreground">
          {formatDate(item.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage News & Editorial"
        description="Live connected article management with real-time status toggling, search query filtering, and optimistic updates."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "News" },
        ]}
        action={
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRssSync}
              disabled={isSyncing}
              className="gap-1.5 border-primary/40 text-primary hover:bg-primary/5 font-semibold"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`}
              />
              🔄 Sync Latest News from RSS Feeds
            </Button>
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
              New Article
            </Button>
          </div>
        }
      />

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl border bg-card">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {["ALL", "FOOTBALL", "BASKETBALL", "TENNIS", "CRICKET", "GENERAL"].map(
            (cat) => (
              <Button
                key={cat}
                size="sm"
                variant={category === cat ? "default" : "outline"}
                onClick={() => setCategory(cat)}
                className="text-xs h-8 rounded-full"
              >
                {cat}
              </Button>
            )
          )}
        </div>

        <div className="relative w-full sm:w-64">
          <Input
            placeholder="Filter by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 text-xs"
          />
        </div>
      </div>

      {/* Main Content Table or SWR Loading Skeleton */}
      {isLoading ? (
        <LoadingTable rows={6} />
      ) : error ? (
        <div className="p-8 text-center rounded-xl border border-destructive/20 bg-destructive/5 text-destructive space-y-2">
          <p className="font-semibold text-sm">Failed to load articles from API.</p>
          <p className="text-xs text-muted-foreground">{error.message}</p>
          <Button size="sm" variant="outline" onClick={() => mutate()}>
            Try Again
          </Button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={articles}
          onDelete={handleDelete}
        />
      )}

      {/* Create Article Dialog Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Article</DialogTitle>
            <DialogDescription>
              Write and publish a new sports article directly to the SQLite database.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="title">Article Title</Label>
              <Input
                id="title"
                placeholder="e.g. Champions League Quarterfinal Tactical Preview"
                value={newTitle}
                onChange={(e) => {
                  setNewTitle(e.target.value);
                  if (!newSlug) {
                    setNewSlug(
                      e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/(^-|-$)+/g, "")
                    );
                  }
                }}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="slug">URL Slug</Label>
              <Input
                id="slug"
                placeholder="e.g. champions-league-tactical-preview"
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="category">Category</Label>
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FOOTBALL">Football</SelectItem>
                    <SelectItem value="BASKETBALL">Basketball</SelectItem>
                    <SelectItem value="TENNIS">Tennis</SelectItem>
                    <SelectItem value="CRICKET">Cricket</SelectItem>
                    <SelectItem value="GENERAL">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="status">Initial Status</Label>
                <Select
                  value={newPublished ? "true" : "false"}
                  onValueChange={(val) => setNewPublished(val === "true")}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Published</SelectItem>
                    <SelectItem value="false">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="coverImage">Cover Image URL</Label>
              <Input
                id="coverImage"
                value={newCoverImage}
                onChange={(e) => setNewCoverImage(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="excerpt">Excerpt / Summary</Label>
              <Input
                id="excerpt"
                placeholder="Brief summary of the article..."
                value={newExcerpt}
                onChange={(e) => setNewExcerpt(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="Full article body content..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                rows={3}
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
                Create Article
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
