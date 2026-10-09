import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";

export default function NewsLoading() {
  return (
    <div className="container py-8 space-y-6">
      <div className="space-y-2 border-b pb-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="flex items-center justify-between gap-4 py-4">
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-9 w-64 rounded-md" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col space-y-3 rounded-xl border p-4 bg-card">
            <Skeleton className="h-48 w-full rounded-lg" />
            <div className="space-y-2 pt-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
            <div className="pt-4 flex justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
