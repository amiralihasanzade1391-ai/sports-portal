"use client";

import * as React from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import {
  Home,
  Newspaper,
  Trophy,
  LayoutDashboard,
  ShieldCheck,
  LogIn,
  UserPlus,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

interface MobileNavProps {
  isLoggedIn: boolean;
  isAdmin: boolean;
}

export function MobileNav({ isLoggedIn, isAdmin }: MobileNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const t = useTranslations("nav");
  const locale = useLocale();
  const isRtl = locale === "fa";

  const publicLinks = [
    { href: "/", label: t("home"), icon: Home },
    { href: "/news", label: t("news"), icon: Newspaper },
    { href: "/matches", label: t("matches"), icon: Trophy },
  ];

  const authLinks = [
    { href: "/login", label: t("login"), icon: LogIn },
    { href: "/signup", label: t("signup"), icon: UserPlus },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>

      {/* RTL Dynamic Drawer: slides from right in Persian, left in English */}
      <SheetContent side={isRtl ? "right" : "left"} className="w-72 p-0">
        <SheetHeader className="p-6 pb-2">
          <SheetTitle className="text-start text-lg font-extrabold flex items-center gap-1.5">
            <span>🏆</span>
            <span>SPORTS</span>
            <span className="font-normal text-muted-foreground">PORTAL</span>
          </SheetTitle>
        </SheetHeader>

        <nav className="flex flex-col gap-1 px-4">
          {/* Public links */}
          {publicLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary font-bold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <link.icon className="h-4 w-4 shrink-0" />
                {link.label}
              </Link>
            );
          })}

          <Separator className="my-3" />

          {/* Authenticated / Dashboard links */}
          {isLoggedIn ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  pathname.startsWith("/dashboard")
                    ? "bg-primary/10 text-primary font-bold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <LayoutDashboard className="h-4 w-4 shrink-0" />
                {t("dashboard")}
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    pathname.startsWith("/admin")
                      ? "bg-primary/10 text-primary font-bold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  {t("admin")}
                </Link>
              )}
            </>
          ) : (
            authLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-primary/10 text-primary font-bold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <link.icon className="h-4 w-4 shrink-0" />
                {link.label}
              </Link>
            ))
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
