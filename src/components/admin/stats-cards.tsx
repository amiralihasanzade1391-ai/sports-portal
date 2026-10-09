import { Users, Newspaper, Trophy, Activity, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardsProps {
  totalUsers?: number;
  totalArticles?: number;
  totalMatches?: number;
  activeMatches?: number;
}

export function StatsCards({
  totalUsers = 1248,
  totalArticles = 142,
  totalMatches = 38,
  activeMatches = 4,
}: StatsCardsProps) {
  const stats = [
    {
      title: "Total Registered Users",
      value: totalUsers.toLocaleString(),
      change: "+12.4% this week",
      icon: Users,
      color: "text-blue-500 bg-blue-500/10",
    },
    {
      title: "Published Articles",
      value: totalArticles.toLocaleString(),
      change: "+8 this month",
      icon: Newspaper,
      color: "text-emerald-500 bg-emerald-500/10",
    },
    {
      title: "Active Matches Scheduled",
      value: totalMatches.toLocaleString(),
      change: "28 completed",
      icon: Trophy,
      color: "text-amber-500 bg-amber-500/10",
    },
    {
      title: "Live Fixtures Right Now",
      value: activeMatches.toLocaleString(),
      change: "Real-time updates enabled",
      icon: Activity,
      color: "text-red-500 bg-red-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <Card key={idx} className="border bg-card shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {stat.title}
              </p>
              <p className="text-2xl sm:text-3xl font-black tracking-tight">
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-emerald-500" />
                {stat.change}
              </p>
            </div>
            <div
              className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}
            >
              <stat.icon className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
