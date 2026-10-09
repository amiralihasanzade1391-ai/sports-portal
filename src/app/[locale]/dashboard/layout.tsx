"use client";

import { Sidebar, type SidebarItem } from "@/components/layout/sidebar";
import { User, Star, MessageSquare, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const dashboardNavItems: SidebarItem[] = [
  {
    title: "Profile & Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Favorite Teams",
    href: "/dashboard/favorites",
    icon: Star,
  },
  {
    title: "Comment History",
    href: "/dashboard/comments",
    icon: MessageSquare,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)]">
      {/* Desktop Sidebar */}
      <Sidebar
        items={dashboardNavItems}
        title="Fan Dashboard"
        titleIcon={User}
      />

      {/* Mobile / Tablet Horizontal Navigation Tabs */}
      <div className="lg:hidden border-b bg-card/60 px-4 py-2 flex items-center gap-2 overflow-x-auto scrollbar-hide">
        {dashboardNavItems.map((item) => {
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

      {/* Main Dashboard Workspace */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-muted/10 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-6">{children}</div>
      </main>
    </div>
  );
}
