"use client";

import { Link } from "@/i18n/navigation";
import { SafeImage } from "@/components/shared/safe-image";
import { motion } from "framer-motion";
import { Clock, MessageSquare, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface NewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  coverImage: string;
  source?: string | null;
  sourceUrl?: string | null;
  author: {
    name: string | null;
  };
  commentsCount?: number;
  createdAt: string;
}

export function NewsCard({ item }: { item: NewsItem }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="h-full"
    >
      <Card className="group overflow-hidden border bg-card hover:shadow-xl transition-all duration-300 flex flex-col h-full">
        <Link href={`/news/${item.slug}`} className="relative h-48 w-full overflow-hidden bg-muted block">
          <SafeImage
            src={item.coverImage}
            alt={item.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 flex items-center gap-1.5 shadow-md">
            <Badge>
              {item.category}
            </Badge>
            {item.source && (
              <Badge variant="secondary" className="bg-background/90 backdrop-blur-xs text-[10px]">
                {item.source}
              </Badge>
            )}
          </div>
        </Link>

        <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1 font-mono">
                <Clock className="h-3 w-3" />
                {item.createdAt}
              </span>
              <span className="flex items-center gap-1 font-mono">
                <MessageSquare className="h-3 w-3" />
                {item.commentsCount ?? 0}
              </span>
            </div>

            <h3 className="font-bold text-lg leading-snug line-clamp-2 group-hover:text-primary transition-colors">
              <Link href={`/news/${item.slug}`}>{item.title}</Link>
            </h3>

            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {item.excerpt}
            </p>
          </div>

          <div className="pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              {item.source ? `${item.source} Wire` : item.author.name || "Sports Staff"}
            </span>

            <Link
              href={`/news/${item.slug}`}
              className="font-bold text-primary hover:underline"
            >
              Read story &rarr;
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
