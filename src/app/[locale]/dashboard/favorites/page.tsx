import { FavoriteTeams } from "@/components/dashboard/favorite-teams";
import { PageHeader } from "@/components/shared/page-header";

export default function DashboardFavoritesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Favorite Teams & Preferences"
        description="Select the clubs and national teams you follow to prioritize their scores, highlights, and news stories."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Favorite Teams" },
        ]}
      />

      <FavoriteTeams />
    </div>
  );
}
