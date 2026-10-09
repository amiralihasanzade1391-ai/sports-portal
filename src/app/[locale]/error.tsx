"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  const locale = useLocale();
  const isRtl = locale === "fa";

  useEffect(() => {
    console.error("[Runtime Error Boundary Caught]:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6 p-8 rounded-3xl border bg-card/60 backdrop-blur-md shadow-xl">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive">
          <AlertTriangle className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black tracking-tight">
            {isRtl ? "توقف غیرمنتظره در جریان مسابقه!" : "Match Play Interrupted!"}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {isRtl
              ? "یک خطای سیستمی در بارگذاری اطلاعات رخ داد. داور بازی در حال بررسی مجدد صحنه است."
              : "An unexpected technical error occurred while rendering the page. Our referee team has been notified."}
          </p>
        </div>

        {error.digest && (
          <div className="p-2.5 rounded-xl bg-muted/50 border font-mono text-[11px] text-muted-foreground">
            Error Digest: {error.digest}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            onClick={() => reset()}
            className="w-full sm:w-auto gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>{isRtl ? "تلاش مجدد" : "Try Again"}</span>
          </Button>

          <Button
            asChild
            variant="outline"
            className="w-full sm:w-auto gap-2"
          >
            <Link href={`/${locale}`}>
              <Home className="h-4 w-4" />
              <span>{isRtl ? "بازگشت به خانه" : "Home Pitch"}</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
