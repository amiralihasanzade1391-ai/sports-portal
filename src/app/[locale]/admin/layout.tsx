"use client";

import { Sidebar, type SidebarItem } from "@/components/layout/sidebar";
import {
  ShieldAlert,
  LayoutDashboard,
  Newspaper,
  Trophy,
  Shield,
  Users,
  Settings,
  UserCheck,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const adminNavItems: SidebarItem[] = [
  {
    title: "Overview",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Articles & News",
    href: "/admin/news",
    icon: Newspaper,
  },
  {
    title: "Matches & Fixtures",
    href: "/admin/matches",
    icon: Trophy,
  },
  {
    title: "Teams & Clubs",
    href: "/admin/teams",
    icon: Shield,
  },
  {
    title: "Players",
    href: "/admin/players",
    icon: UserCheck,
  },
  {
    title: "Data Providers",
    href: "/admin/providers",
    icon: Activity,
  },
  {
    title: "User Accounts",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Site Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)]">
      {/* Desktop Sidebar */}
      <Sidebar
        items={adminNavItems}
        title="Admin Console"
        titleIcon={ShieldAlert}
      />

      {/* Mobile / Tablet Horizontal Navigation Tabs */}
      <div className="lg:hidden border-b bg-card/70 px-4 py-2 flex items-center gap-2 overflow-x-auto scrollbar-hide">
        {adminNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md shrink-0 transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              <item.icon className="h-3.5 w-3.5" />
              {item.title}
            </Link>
          );
        })}
      </div>

      {/* Main Admin Workspace */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-muted/15 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">{children}</div>
      </main>
    </div>
  );
}
