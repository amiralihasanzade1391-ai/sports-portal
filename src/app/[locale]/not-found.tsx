"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Flag, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  const t = useTranslations("notFound");

  return (
    <div className="min-h-[75vh] flex items-center justify-center container py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full text-center space-y-6 p-8 rounded-2xl border bg-card/60 backdrop-blur-sm shadow-xl"
      >
        {/* Referee Cards Visual */}
        <div className="relative h-28 w-28 mx-auto flex items-center justify-center">
          <motion.div
            animate={{ rotate: [-6, 6, -6] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute h-20 w-14 rounded-lg bg-amber-400 border-2 border-amber-500 shadow-md rotate-[-8deg] -translate-x-3 -translate-y-1"
          />
          <motion.div
            animate={{ rotate: [6, -6, 6] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute h-20 w-14 rounded-lg bg-red-600 border-2 border-red-700 shadow-lg rotate-[8deg] translate-x-3 translate-y-1 flex items-center justify-center text-white"
          >
            <Flag className="h-6 w-6" />
          </motion.div>
        </div>

        <div className="space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-primary font-mono">
            404 • VAR Review
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t("description")}
          </p>
        </div>

        <div className="pt-2 flex justify-center">
          <Button asChild size="lg" className="gap-2 font-semibold shadow-md">
            <Link href="/">
              <Home className="h-4 w-4" />
              {t("backHome")}
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
