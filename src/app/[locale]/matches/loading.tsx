import { Skeleton } from "@/components/ui/skeleton";

export default function MatchesLoading() {
  return (
    <div className="container py-8 space-y-6">
      <div className="space-y-2 border-b pb-6">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-4 w-[500px]" />
      </div>

      <div className="flex gap-2">
        <Skeleton className="h-9 w-24 rounded-md" />
        <Skeleton className="h-9 w-24 rounded-md" />
        <Skeleton className="h-9 w-28 rounded-md" />
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border p-4 bg-card space-y-4">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-12" />
            </div>
            <div className="space-y-3 py-2">
              <div className="flex justify-between items-center">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-6 w-8" />
              </div>
              <div className="flex justify-between items-center">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-6 w-8" />
              </div>
            </div>
            <div className="border-t pt-2 flex justify-between">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
