import { StatsCards } from "@/components/admin/stats-cards";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function AdminDashboardPage() {
  const recentActivities = [
    { text: "New article published: 'Champions League Quarterfinals'", time: "10 mins ago" },
    { text: "Match completed: Inter Milan (3) vs (1) AC Milan", time: "45 mins ago" },
    { text: "User registered and verified email", time: "2 hours ago" },
    { text: "Player stats updated: Erling Haaland (+2 Goals)", time: "3 hours ago" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Control Center"
        description="Monitor portal health, live sports matches, editorial content pipeline, and community metrics."
        breadcrumbs={[{ label: "Admin" }]}
      />

      {/* Metrics Row */}
      <StatsCards />

      {/* Management Quick Links & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border bg-card shadow-xs">
          <CardHeader>
            <CardTitle>Recent Administrative Actions</CardTitle>
            <CardDescription>
              Audit trail of content updates, match recordings, and user signups.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivities.map((act, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg border bg-muted/20 text-sm"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>{act.text}</span>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{act.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border bg-card shadow-xs flex flex-col justify-between">
          <CardHeader>
            <CardTitle>Quick Management</CardTitle>
            <CardDescription>Fast shortcuts to core portal tasks.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            <Button variant="outline" className="w-full justify-between" asChild>
              <Link href="/admin/news">
                <span>Manage Editorial News</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-between" asChild>
              <Link href="/admin/matches">
                <span>Schedule Fixtures</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-between" asChild>
              <Link href="/admin/teams">
                <span>Directory of Clubs</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-between" asChild>
              <Link href="/admin/players">
                <span>Player Rosters & Stats</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
