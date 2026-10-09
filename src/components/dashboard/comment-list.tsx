"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import Link from "next/link";
import { fetcher } from "@/lib/fetcher";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingTable } from "@/components/shared/loading-skeleton";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import { MessageSquare, Trash2, ExternalLink, Search, RefreshCw } from "lucide-react";

interface CommentRecord {
  id: string;
  content: string;
  createdAt: string;
  article: {
    id: string;
    title: string;
    slug: string;
  };
}

interface CommentsApiResponse {
  success: boolean;
  data: CommentRecord[];
  total: number;
}

export function CommentList() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [searchQuery, setSearchQuery] = useState("");
  const [commentToDelete, setCommentToDelete] = useState<CommentRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch comments authored by this user
  const apiUrl = userId ? `/api/comments?userId=${userId}&pageSize=50` : null;

  const {
    data: commentsData,
    isLoading,
    isValidating,
    mutate,
  } = useSWR<CommentsApiResponse>(apiUrl, fetcher, {
    revalidateOnFocus: false,
  });

  const comments = commentsData?.data || [];

  // Filter comments locally by search term
  const filteredComments = comments.filter((c) => {
    return (
      c.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.article.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // ─── Optimistic Comment Deletion with ConfirmDialog ─────────────────────────
  const handleConfirmDelete = async () => {
    if (!commentToDelete) return;
    setIsDeleting(true);
    const previousData = commentsData;
    const item = commentToDelete;

    // 1. Optimistic removal
    mutate(
      (current) =>
        current
          ? {
              ...current,
              data: current.data.filter((c) => c.id !== item.id),
              total: Math.max(0, current.total - 1),
            }
          : current,
      false
    );

    try {
      const res = await fetch(`/api/comments/${item.id}`, {
        method: "DELETE",
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to delete comment");
      }

      toast({
        title: "Comment Deleted",
        description: "Your discussion entry was permanently removed.",
      });

      setCommentToDelete(null);
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
      setCommentToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border bg-card shadow-xs">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle>My Discussion History</CardTitle>
            <CardDescription>
              Review, search, and manage your comments across published sports articles.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1 font-semibold">
              <MessageSquare className="h-3.5 w-3.5" />
              {comments.length} Comments
            </Badge>
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
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Filter Box */}
          {comments.length > 0 && (
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search in your comments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-8 text-xs"
              />
            </div>
          )}

          {isLoading ? (
            <LoadingTable rows={4} />
          ) : comments.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="No comments published yet"
              description="Join discussions on breaking stories, post your match analysis, and engage with the community!"
              actionLabel="Explore Latest News"
              actionHref="/news"
            />
          ) : filteredComments.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground py-8">
              No comments match &ldquo;{searchQuery}&rdquo;.
            </p>
          ) : (
            <div className="space-y-3">
              {filteredComments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-4 rounded-xl border bg-card/60 hover:bg-muted/20 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <Link
                      href={`/news/${comment.article.slug}`}
                      className="font-bold text-sm text-foreground hover:text-primary transition-colors flex items-center gap-1.5 line-clamp-1"
                    >
                      <span>{comment.article.title}</span>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    </Link>
                    <span className="text-xs text-muted-foreground shrink-0 font-mono">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed pl-3 border-l-2 border-primary/40 italic">
                    &ldquo;{comment.content}&rdquo;
                  </p>

                  <div className="flex justify-end pt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCommentToDelete(comment)}
                      className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete Comment
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reusable ConfirmDialog for Comment Deletion */}
      <ConfirmDialog
        open={!!commentToDelete}
        onOpenChange={(open) => !open && setCommentToDelete(null)}
        title="Delete this comment?"
        description="Are you sure you want to delete your comment? This cannot be undone and will remove it from the article discussion thread."
        confirmLabel="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
