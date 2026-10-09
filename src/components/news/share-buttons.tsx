"use client";

import { Share2, Link as LinkIcon, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface ShareButtonsProps {
  title: string;
}

export function ShareButtons({ title }: ShareButtonsProps) {
  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied!",
        description: "Article URL copied to your clipboard.",
      });
    }
  };

  const handleShareTwitter = () => {
    if (typeof window !== "undefined") {
      const url = encodeURIComponent(window.location.href);
      const text = encodeURIComponent(`Read "${title}" on Sports Portal:`);
      window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, "_blank");
    }
  };

  const handleNativeShare = () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator
        .share({
          title,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopyLink}
        className="gap-1.5 text-xs h-8"
        title="Copy article link"
      >
        <LinkIcon className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Copy Link</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleShareTwitter}
        className="gap-1.5 text-xs h-8"
        title="Share on X / Twitter"
      >
        <Twitter className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Post</span>
      </Button>

      <Button
        variant="default"
        size="sm"
        onClick={handleNativeShare}
        className="gap-1.5 text-xs h-8"
      >
        <Share2 className="h-3.5 w-3.5" />
        <span>Share</span>
      </Button>
    </div>
  );
}
