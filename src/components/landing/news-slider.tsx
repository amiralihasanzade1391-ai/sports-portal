import Link from "next/link";
import { SafeImage } from "@/components/shared/safe-image";
import { ArrowRight, Clock, RefreshCw, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/lib/utils";

export interface NewsSliderItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  coverImage: string;
  source?: string | null;
  sourceUrl?: string | null;
  createdAt: string | Date;
}

export function NewsSlider({ articles = [] }: { articles?: NewsSliderItem[] }) {
  const hasArticles = articles && articles.length > 0;

  return (
    <section className="py-14 border-b bg-card/20">
      <div className="container space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <Badge variant="outline" className="mb-2 text-primary border-primary/30">
              Breaking Coverage
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Latest Sports News & Analysis
            </h2>
          </div>
          <Button variant="ghost" asChild className="gap-1.5 text-primary hover:text-primary">
            <Link href="/news">
              View All Articles <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {!hasArticles ? (
          <div className="p-12 text-center rounded-2xl border bg-muted/20 space-y-3">
            <RefreshCw className="h-8 w-8 text-primary animate-spin mx-auto opacity-75" />
            <h3 className="font-bold text-lg">News syncing in progress...</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Real-time sports headlines are being synced from BBC Sport, Sky Sports, and global wire feeds.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Card
                key={article.id}
                className="group overflow-hidden border bg-card hover:shadow-lg transition-all duration-300 flex flex-col"
              >
                <div className="relative h-48 w-full overflow-hidden bg-muted">
                  <SafeImage
                    src={article.coverImage}
                    alt={article.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <Badge className="shadow-md">
                      {article.category}
                    </Badge>
                    {article.source && (
                      <Badge variant="secondary" className="shadow-md bg-background/80 backdrop-blur-xs text-[10px]">
                        {article.source}
                      </Badge>
                    )}
                  </div>
                </div>

                <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{formatRelativeTime(article.createdAt)}</span>
                    </div>
                    <h3 className="font-bold text-lg leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                      <Link href={`/news/${article.slug}`}>{article.title}</Link>
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {article.excerpt}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t text-xs">
                    <span className="font-semibold text-primary group-hover:underline">
                      Read full article →
                    </span>
                    {article.source && (
                      <span className="text-muted-foreground text-[11px]">
                        via {article.source}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
