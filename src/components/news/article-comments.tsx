"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { MessageSquare, Send, Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { formatRelativeTime, getInitials } from "@/lib/utils";

interface CommentItem {
  id: string;
  content: string;
  createdAt: string | Date;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface ArticleCommentsProps {
  articleId: string;
  initialComments: CommentItem[];
}

export function ArticleComments({ articleId, initialComments }: ArticleCommentsProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<CommentItem[]>(initialComments);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to participate in sports article discussions.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId,
          content: commentText.trim(),
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to post comment");
      }

      setComments([result.data, ...comments]);
      setCommentText("");
      toast({
        title: "Comment Published",
        description: "Your comment was added to the article discussion.",
      });
    } catch (err: any) {
      toast({
        title: "Submission Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h3 className="text-2xl font-bold tracking-tight">
          Discussion ({comments.length})
        </h3>
      </div>

      {session ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            placeholder="Share your tactical thoughts, analysis, or reaction..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="min-h-[100px]"
            disabled={isSubmitting}
            required
          />
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">
              Posting as <span className="font-semibold text-foreground">{session.user.name || session.user.email}</span>
            </p>
            <Button type="submit" disabled={isSubmitting || !commentText.trim()} className="gap-2 font-semibold">
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Post Comment
            </Button>
          </div>
        </form>
      ) : (
        <div className="p-6 rounded-xl border border-dashed text-center bg-muted/20 space-y-3">
          <p className="text-sm text-muted-foreground">
            Sign in to join the conversation and share your sports insights with fellow fans.
          </p>
          <div className="flex justify-center gap-3">
            <Button size="sm" asChild className="gap-1.5">
              <Link href="/login">
                <LogIn className="h-4 w-4" /> Log In to Comment
              </Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-3 pt-2">
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground italic py-4">
            No comments yet. Be the first to share your perspective!
          </p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="p-4 rounded-xl border bg-card/60 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Avatar className="h-8 w-8 border">
                    <AvatarImage src={c.user.image || undefined} />
                    <AvatarFallback className="text-xs font-bold">
                      {getInitials(c.user.name || "Fan")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-semibold text-sm">{c.user.name || "Sports Fan"}</span>
                </div>
                <span className="text-xs text-muted-foreground font-mono">
                  {formatRelativeTime(c.createdAt)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground pl-10 leading-relaxed whitespace-pre-line">
                {c.content}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
