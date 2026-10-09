import Link from "next/link";
import { Trophy } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-muted/20">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[300px] bg-primary/15 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <Link href="/" className="inline-flex items-center gap-2 mb-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 border flex items-center justify-center text-primary">
            <Trophy className="h-6 w-6" />
          </div>
          <span className="text-2xl font-black tracking-tight">
            SPORTS<span className="text-muted-foreground font-light">PORTAL</span>
          </span>
        </Link>
        <p className="text-xs text-muted-foreground uppercase tracking-widest">
          The Hub for True Sports Enthusiasts
        </p>
      </div>

      <div className="w-full sm:max-w-md">{children}</div>
    </div>
  );
}
