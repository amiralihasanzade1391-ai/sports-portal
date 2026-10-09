import { Trophy } from "lucide-react";

export default function GlobalRouteLoading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
      <div className="relative flex items-center justify-center">
        {/* Radar Pulse Rings */}
        <div className="absolute h-20 w-20 rounded-full border-2 border-primary/20 animate-ping" />
        <div className="absolute h-16 w-16 rounded-full border border-primary/40 animate-pulse" />

        {/* Center Icon Badge */}
        <div className="relative h-14 w-14 rounded-2xl bg-card border-2 border-primary/40 shadow-xl flex items-center justify-center text-primary">
          <Trophy className="h-7 w-7 animate-bounce text-primary" />
        </div>
      </div>

      <div className="text-center space-y-1 pt-2">
        <p className="text-sm font-bold tracking-tight text-foreground">
          Sports Portal
        </p>
        <p className="text-xs text-muted-foreground animate-pulse font-mono">
          Syncing live match feeds...
        </p>
      </div>
    </div>
  );
}
