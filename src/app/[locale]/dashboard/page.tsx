"use client";

import { useSession } from "next-auth/react";
import useSWR from "swr";
import { useLocale, useTranslations } from "next-intl";
import { fetcher } from "@/lib/fetcher";
import { formatLocalizedNumber, formatLocalizedDate } from "@/lib/i18n-utils";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Star, MessageSquare, Shield, Calendar } from "lucide-react";

interface UserProfileResponse {
  success: boolean;
  data: {
    id: string;
    name: string | null;
    email: string;
    role: "USER" | "ADMIN";
    createdAt: string;
    _count?: {
      comments: number;
      favoriteTeams: number;
      articles: number;
    };
  };
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const locale = useLocale();
  const tNav = useTranslations("nav");
  const tDash = useTranslations("dashboard");

  const { data } = useSWR<UserProfileResponse>(
    userId ? `/api/users/${userId}` : null,
    fetcher
  );

  const user = data?.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title={tDash("overviewTitle")}
        description={tDash("overviewDesc")}
        breadcrumbs={[{ label: tNav("dashboard") }]}
      />

      {/* Real-time Stat Cards with Localized Numbers */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border bg-card shadow-2xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Star className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black">
                {formatLocalizedNumber(user?._count?.favoriteTeams ?? 0, locale)}
              </p>
              <p className="text-xs text-muted-foreground">{tDash("clubsFollowed")}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border bg-card shadow-2xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black">
                {formatLocalizedNumber(user?._count?.comments ?? 0, locale)}
              </p>
              <p className="text-xs text-muted-foreground">{tDash("commentsPosted")}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border bg-card shadow-2xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-wider text-primary">
                {user?.role || session?.user?.role || "USER"}
              </p>
              <p className="text-xs text-muted-foreground">{tDash("memberStatus")}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border bg-card shadow-2xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold leading-tight line-clamp-1">
                {user?.createdAt ? formatLocalizedDate(user.createdAt, locale) : "Member"}
              </p>
              <p className="text-xs text-muted-foreground">{tDash("memberSince")}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <ProfileForm />
    </div>
  );
}
