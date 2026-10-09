"use client";

import * as React from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { useSession, signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  Newspaper,
  Trophy,
  LayoutDashboard,
  ShieldCheck,
  LogOut,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeSwitcher } from "@/components/shared/theme-switcher";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { MobileNav } from "@/components/layout/mobile-nav";
import { getInitials } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const t = useTranslations("nav");
  const isAdmin = session?.user?.role === "ADMIN";

  // Glassmorphism state on scroll
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: t("home") },
    { href: "/news", label: t("news"), icon: Newspaper },
    { href: "/matches", label: t("matches"), icon: Trophy },
  ];

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled
          ? "backdrop-blur-md bg-background/75 border-b shadow-sm"
          : "bg-background/95 border-b supports-[backdrop-filter]:bg-background/60"
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        {/* ── Brand Logo ─────────────────────────────────── */}
        <Link href="/" className="flex items-center gap-2 me-6 hover:opacity-90 transition-opacity">
          <div className="text-primary font-extrabold text-xl tracking-tight flex items-center gap-1.5">
            <span className="text-2xl">🏆</span>
            <span className="hidden sm:inline">SPORTS</span>
            <span className="hidden sm:inline text-muted-foreground font-normal">PORTAL</span>
          </div>
        </Link>

        {/* ── Desktop Navigation Links ───────────────────── */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative px-3 py-2 text-sm font-medium transition-colors rounded-md hover:text-primary",
                  isActive
                    ? "text-primary font-bold"
                    : "text-muted-foreground"
                )}
              >
                {link.label}
                {isActive && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute bottom-0 inset-x-0 h-0.5 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── Controls: Language Switcher, Theme Switcher, Auth ── */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Theme Switcher */}
          <ThemeSwitcher />

          {status === "loading" ? (
            <div className="h-9 w-9 animate-pulse rounded-full bg-muted ms-1" />
          ) : session ? (
            /* ── Authenticated User Dropdown Menu ───────── */
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full ms-1 ring-1 ring-border hover:ring-primary transition-all"
                >
                  <Avatar className="h-9 w-9 border">
                    <AvatarImage
                      src={session.user.image || undefined}
                      alt={session.user.name || "User"}
                    />
                    <AvatarFallback className="text-xs font-bold">
                      {getInitials(session.user.name || session.user.email || "U")}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {session.user.name || "User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer">
                    <LayoutDashboard className="me-2 h-4 w-4" />
                    {t("dashboard")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer">
                    <User className="me-2 h-4 w-4" />
                    {t("profile")}
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="cursor-pointer">
                      <ShieldCheck className="me-2 h-4 w-4" />
                      {t("admin")}
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <LogOut className="me-2 h-4 w-4" />
                  {t("logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            /* ── Guest Sign In / Sign Up Buttons ───────── */
            <div className="hidden md:flex items-center gap-1.5 ms-1">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">{t("login")}</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">{t("signup")}</Link>
              </Button>
            </div>
          )}

          {/* ── Mobile Hamburger Drawer ────────────────── */}
          <div className="md:hidden ms-1">
            <MobileNav isLoggedIn={!!session} isAdmin={isAdmin} />
          </div>
        </div>
      </div>
    </motion.header>
  );
}
