"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

/* ──────────────────────────────────────────────────────────
 * Sidebar — reusable for both User Dashboard and Admin Panel.
 * Supports localized Link navigation and RTL logical borders.
 * ────────────────────────────────────────────────────────── */

export interface SidebarItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

interface SidebarProps {
  items: SidebarItem[];
  title: string;
  titleIcon?: LucideIcon;
}

export function Sidebar({ items, title, titleIcon: TitleIcon }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-e lg:bg-card lg:min-h-[calc(100vh-4rem)]">
      {/* ── Sidebar header ──────────────────────────── */}
      <div className="p-6 pb-4">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          {TitleIcon && <TitleIcon className="h-5 w-5 text-primary" />}
          {title}
        </h2>
      </div>

      {/* ── Navigation items ────────────────────────── */}
      <nav className="flex-1 px-4 space-y-1">
        {items.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-primary/10 text-primary shadow-sm font-bold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
