import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { BreadcrumbItem } from "@/types";

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  action?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  action,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b bg-card/40 py-6 mb-8">
      <div className="container flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1.5">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="flex items-center space-x-1.5 text-xs text-muted-foreground mb-2">
              <Link href="/" className="hover:text-primary transition-colors">
                Home
              </Link>
              {breadcrumbs.map((crumb, idx) => (
                <div key={idx} className="flex items-center space-x-1.5">
                  <ChevronRight className="h-3.5 w-3.5 opacity-50" />
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      className="hover:text-primary transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-foreground font-medium">
                      {crumb.label}
                    </span>
                  )}
                </div>
              ))}
            </nav>
          )}
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
              {description}
            </p>
          )}
        </div>
        {action && <div className="flex items-center gap-2">{action}</div>}
      </div>
    </div>
  );
}
