import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Trophy, Github, Twitter, Mail } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  const t = useTranslations("footer");

  const footerSections = [
    {
      title: t("sports"),
      links: [
        { label: t("football"), href: "/news?category=FOOTBALL" },
        { label: t("basketball"), href: "/news?category=BASKETBALL" },
        { label: t("tennis"), href: "/news?category=TENNIS" },
        { label: t("cricket"), href: "/news?category=CRICKET" },
      ],
    },
    {
      title: t("quickLinks"),
      links: [
        { label: t("latestNews"), href: "/news" },
        { label: t("liveScores"), href: "/matches" },
        { label: t("schedules"), href: "/matches" },
      ],
    },
    {
      title: t("account"),
      links: [
        { label: "Login", href: "/login" },
        { label: "Sign Up", href: "/signup" },
        { label: "Dashboard", href: "/dashboard" },
      ],
    },
  ];

  const socialLinks = [
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Github, href: "#", label: "GitHub" },
    { icon: Mail, href: "#", label: "Email" },
  ];

  return (
    <footer className="border-t bg-card mt-auto">
      <div className="container py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* ── Brand Column ──────────────────────────────── */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <Link href="/" className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-primary" />
              <span className="font-extrabold text-lg">
                SPORTS
                <span className="font-normal text-muted-foreground">
                  PORTAL
                </span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("brandDescription")}
            </p>

            {/* Social Icons */}
            <div className="flex gap-3 pt-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="flex h-9 w-9 items-center justify-center rounded-md border text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* ── Link Columns ──────────────────────────────── */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold text-sm mb-3">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        {/* ── Copyright & Legal ───────────────────────────── */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row text-xs text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} {t("copyright")}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <a
              href="https://www.football-charts.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              Data by football-charts.com
            </a>
            <span className="text-muted-foreground/40">•</span>
            <Link href="#" className="hover:text-primary transition-colors">
              {t("privacyPolicy")}
            </Link>
            <Link href="#" className="hover:text-primary transition-colors">
              {t("termsOfService")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
