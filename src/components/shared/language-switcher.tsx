"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe, Check, Loader2 } from "lucide-react";

const LANGUAGES: Array<{ code: Locale; label: string; flag: string }> = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "fa", label: "فارسی", flag: "🇮🇷" },
];

export function LanguageSwitcher() {
  const currentLocale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("language");

  const handleLanguageChange = (nextLocale: Locale) => {
    if (nextLocale === currentLocale) return;

    // Persist language choice in NEXT_LOCALE cookie (Senior Product Engineer Feature)
    if (typeof document !== "undefined") {
      document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
    }

    startTransition(() => {
      // router.replace preserves the exact same path and query parameters
      router.replace(pathname, { locale: nextLocale });
    });
  };

  const currentLang = LANGUAGES.find((l) => l.code === currentLocale) || LANGUAGES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={isPending}
          className="h-9 px-2.5 gap-1.5 font-medium text-xs focus:ring-0"
          aria-label={t("switchLanguage")}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <>
              <span className="text-base leading-none">{currentLang.flag}</span>
              <span className="hidden sm:inline-block font-semibold uppercase">
                {currentLang.code}
              </span>
              <Globe className="h-3.5 w-3.5 text-muted-foreground sm:hidden" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-40">
        {LANGUAGES.map((lang) => {
          const isSelected = lang.code === currentLocale;
          return (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className="flex items-center justify-between cursor-pointer text-xs py-2"
            >
              <div className="flex items-center gap-2">
                <span className="text-base leading-none">{lang.flag}</span>
                <span className={isSelected ? "font-bold text-foreground" : "text-muted-foreground"}>
                  {lang.label}
                </span>
              </div>
              {isSelected && <Check className="h-3.5 w-3.5 text-primary ms-2" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
