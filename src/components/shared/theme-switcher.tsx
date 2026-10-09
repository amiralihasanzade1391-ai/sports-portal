"use client";

import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Palette } from "lucide-react";
import { cn } from "@/lib/utils";

/* ──────────────────────────────────────────────────────────
 * ThemeSwitcher — dropdown to toggle between 4 themes.
 *
 * Themes:
 *   ☀️  Light       — Clean whites
 *   🌙 Dark        — Deep navy
 *   🏟️  Stadium     — Vibrant green
 *   ⚡  Neon Night  — Black + neon orange/cyan
 * ────────────────────────────────────────────────────────── */

export function ThemeSwitcher() {
  const { theme, setTheme, themes } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Palette className="h-4 w-4" />
          <span className="sr-only">Switch theme</span>

          {/* Active theme color indicator dot */}
          <span
            className={cn(
              "absolute top-1 right-1 h-2 w-2 rounded-full border border-background",
              theme === "light" && "bg-blue-600",
              theme === "dark" && "bg-blue-400",
              theme === "stadium" && "bg-green-500",
              theme === "neon" && "bg-orange-500"
            )}
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-44">
        {themes.map((t) => (
          <DropdownMenuItem
            key={t.value}
            onClick={() => setTheme(t.value)}
            className={cn(
              "flex items-center gap-3 cursor-pointer",
              theme === t.value && "bg-accent"
            )}
          >
            {/* Theme color preview swatch */}
            <span
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-full border text-xs",
                t.value === "light" && "bg-white border-gray-300",
                t.value === "dark" && "bg-slate-800 border-slate-600",
                t.value === "stadium" && "bg-green-500 border-green-600",
                t.value === "neon" && "bg-gray-950 border-orange-500"
              )}
            >
              {t.value === "neon" && (
                <span className="h-2 w-2 rounded-full bg-orange-500" />
              )}
            </span>

            <span className="flex-1 text-sm">{t.label}</span>

            {/* Active checkmark */}
            {theme === t.value && (
              <span className="text-primary text-xs">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
