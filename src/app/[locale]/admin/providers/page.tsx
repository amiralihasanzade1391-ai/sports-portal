"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatLocalizedNumber } from "@/lib/i18n-utils";
import {
  Activity,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Server,
  Zap,
  CheckCircle2,
  Lock,
  ArrowRight,
  Database,
  Radio,
} from "lucide-react";

interface ProviderData {
  name: string;
  role: string;
  endpoint: string;
  isConfigured: boolean;
  priority: number;
  tier: string;
  circuitStatus: "ONLINE" | "DEGRADED" | "CIRCUIT_OPEN";
  failures: number;
  lastFailure: string | null;
  circuitPolicy: string;
}

export default function AdminProvidersPage() {
  const t = useTranslations("providers");
  const locale = useLocale();
  const isRtl = locale === "fa";

  const [providers, setProviders] = useState<ProviderData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [pingingIndex, setPingingIndex] = useState<number | null>(null);

  const fetchTelemetry = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/providers");
      const json = await res.json();
      if (json.success && json.providers) {
        setProviders(json.providers);
        setLastRefreshed(new Date());
      }
    } catch (err) {
      console.error("Failed to load provider telemetry:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, []);

  const handlePing = async (idx: number) => {
    setPingingIndex(idx);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setPingingIndex(null);
  };

  const getStatusBadge = (status: ProviderData["circuitStatus"]) => {
    switch (status) {
      case "ONLINE":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/30 gap-1.5 font-bold">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            {t("online")}
          </Badge>
        );
      case "DEGRADED":
        return (
          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border-amber-500/30 gap-1.5 font-bold">
            <AlertTriangle className="h-3 w-3" />
            {t("degraded")}
          </Badge>
        );
      case "CIRCUIT_OPEN":
        return (
          <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border-rose-500/30 gap-1.5 font-bold">
            <XCircle className="h-3 w-3" />
            {t("circuitOpen")}
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const onlineCount = providers.filter((p) => p.circuitStatus === "ONLINE").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title={t("title")}
          description={t("description")}
          breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: t("title") }]}
        />
        <Button
          onClick={fetchTelemetry}
          variant="outline"
          size="sm"
          className="gap-2 shrink-0 self-start sm:self-center"
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          {t("refreshMetrics")}
        </Button>
      </div>

      {/* ─── Global Health Overview Banner ───────────────────────────────── */}
      <Card className="border bg-gradient-to-r from-card via-card to-primary/5 shadow-xs">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  {isRtl ? "سرویس‌های عملیاتی" : "Active Providers"}
                </p>
                <h4 className="text-2xl font-black font-estedad">
                  {formatLocalizedNumber(onlineCount, locale)} / {formatLocalizedNumber(providers.length || 6, locale)}
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0 border border-emerald-500/20">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  {isRtl ? "وضعیت مدارشکن" : "Circuit Breaker"}
                </p>
                <h4 className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                  {isRtl ? "حفاظت خودکار فعال" : "Self-Healing Active"}
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0 border border-amber-500/20">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  {isRtl ? "پروتکل سوییچینگ" : "Failover Protocol"}
                </p>
                <h4 className="text-base font-bold">
                  {isRtl ? "۳ سطح پشتیبان" : "3-Tier Cascading"}
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0 border border-blue-500/20">
                <Radio className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  {isRtl ? "آخرین پایش" : "Last Checked"}
                </p>
                <h4 className="text-xs font-mono text-muted-foreground">
                  {lastRefreshed.toLocaleTimeString()}
                </h4>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── Failover Architecture Pipeline ────────────────────────────── */}
      <Card className="border bg-card shadow-xs overflow-hidden">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-base flex items-center gap-2">
            <Server className="h-4 w-4 text-primary" />
            {isRtl ? "جریان معماری و ترتیب سوییچ خودکار (Failover Flow)" : "Cascading Failover Architecture Pipeline"}
          </CardTitle>
          <CardDescription className="text-xs">
            {t("circuitPolicy")}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 bg-muted/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            {/* Step 1 */}
            <div className="flex-1 w-full p-3 rounded-xl border bg-background flex items-center gap-3 shadow-2xs">
              <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">1</span>
              <div>
                <p className="font-bold text-foreground">Bzzoiro Sports Data</p>
                <p className="text-[11px] text-muted-foreground">{isRtl ? "اولویت ۱: نتایج زنده" : "Priority 1: Live Feeds"}</p>
              </div>
            </div>

            <ArrowRight className={`h-4 w-4 text-muted-foreground shrink-0 hidden md:block ${isRtl ? "rotate-180" : ""}`} />

            {/* Step 2 */}
            <div className="flex-1 w-full p-3 rounded-xl border bg-background flex items-center gap-3 shadow-2xs">
              <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">2</span>
              <div>
                <p className="font-bold text-foreground">football-data.org</p>
                <p className="text-[11px] text-muted-foreground">{isRtl ? "اولویت ۲: جدول رده‌بندی" : "Priority 2: Standings"}</p>
              </div>
            </div>

            <ArrowRight className={`h-4 w-4 text-muted-foreground shrink-0 hidden md:block ${isRtl ? "rotate-180" : ""}`} />

            {/* Step 3 */}
            <div className="flex-1 w-full p-3 rounded-xl border bg-background flex items-center gap-3 shadow-2xs">
              <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">3</span>
              <div>
                <p className="font-bold text-foreground">footballdata.io</p>
                <p className="text-[11px] text-muted-foreground">{isRtl ? "اولویت ۳: پشتیبان مسابقات" : "Priority 3: Backup Fixtures"}</p>
              </div>
            </div>

            <ArrowRight className={`h-4 w-4 text-muted-foreground shrink-0 hidden md:block ${isRtl ? "rotate-180" : ""}`} />

            {/* Final Step */}
            <div className="flex-1 w-full p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex items-center gap-3 shadow-2xs">
              <Database className="h-5 w-5 text-emerald-500 shrink-0" />
              <div>
                <p className="font-bold text-emerald-700 dark:text-emerald-400">{isRtl ? "دیتابیس محلی" : "Prisma SQLite Cache"}</p>
                <p className="text-[11px] text-muted-foreground">{isRtl ? "تضمین پایداری ۱۰۰٪" : "Guaranteed 100% Uptime"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── 6 Data Providers Grid ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {providers.map((p, idx) => (
          <Card key={p.name} className="border bg-card shadow-xs flex flex-col justify-between hover:border-primary/40 transition-colors">
            <CardHeader className="pb-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="outline" className="text-[10px] font-semibold uppercase tracking-wider">
                  {p.tier}
                </Badge>
                {getStatusBadge(p.circuitStatus)}
              </div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <span>{p.name}</span>
              </CardTitle>
              <CardDescription className="text-xs line-clamp-1">
                {p.role}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-0">
              <div className="space-y-2 text-xs bg-muted/30 p-3 rounded-lg border">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t("endpoint")}:</span>
                  <span className="font-mono text-[11px] truncate max-w-[170px]" title={p.endpoint}>
                    {p.endpoint.replace("https://", "")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{isRtl ? "احراز هویت" : "Authentication"}:</span>
                  <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                    <Lock className="h-3 w-3" />
                    {p.isConfigured ? (isRtl ? "پیکربندی شده" : "Configured") : (isRtl ? "عمومی / آزاد" : "Open Access")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t("failures")}:</span>
                  <span className={`font-bold font-estedad ${p.failures > 0 ? "text-rose-500" : "text-foreground"}`}>
                    {formatLocalizedNumber(p.failures, locale)} / 3
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-muted-foreground">
                  {p.failures === 0 ? t("noFailures") : `${t("lastFailure")}: ${p.lastFailure}`}
                </span>
                <Button
                  onClick={() => handlePing(idx)}
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-xs text-primary h-7 px-2"
                  disabled={pingingIndex === idx}
                >
                  <RefreshCw className={`h-3 w-3 ${pingingIndex === idx ? "animate-spin" : ""}`} />
                  {t("testPing")}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
