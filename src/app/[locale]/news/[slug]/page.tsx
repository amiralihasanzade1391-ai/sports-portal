import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SafeImage } from "@/components/shared/safe-image";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getLocalizedField, formatLocalizedDate, formatLocalizedNumber } from "@/lib/i18n-utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { NewsCard } from "@/components/news/news-card";
import { ArticleComments } from "@/components/news/article-comments";
import { ShareButtons } from "@/components/news/share-buttons";
import { getInitials } from "@/lib/utils";
import { ArrowLeft, Clock, Calendar, Sparkles, ExternalLink } from "lucide-react";

interface SingleArticlePageProps {
  params: { locale: string; slug: string };
}

// ─── Dynamic SEO Metadata Generator with Dual-Language Support ────────────────

export async function generateMetadata({
  params: { locale, slug },
}: SingleArticlePageProps): Promise<Metadata> {
  const article = await prisma.article.findFirst({
    where: {
      OR: [{ slug }, { id: slug }],
    },
  });

  if (!article) {
    return {
      title: "Article Not Found | Sports Portal",
      description: "The requested sports article could not be located.",
    };
  }

  const title = getLocalizedField(article, "title", locale);
  const excerpt = getLocalizedField(article, "excerpt", locale);

  return {
    title: `${title} | Sports Portal`,
    description: excerpt,
    openGraph: {
      title,
      description: excerpt,
      type: "article",
      images: [
        {
          url: article.coverImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      publishedTime: article.createdAt.toISOString(),
      section: article.category,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: excerpt,
      images: [article.coverImage],
    },
  };
}

export default async function SingleArticlePage({
  params: { locale, slug },
}: SingleArticlePageProps) {
  const t = await getTranslations({ locale, namespace: "news" });

  // Query article with author and discussion comments
  const article = await prisma.article.findFirst({
    where: {
      OR: [{ slug }, { id: slug }],
      published: true,
    },
    include: {
      author: {
        select: { id: true, name: true, image: true, role: true },
      },
      comments: {
        include: {
          user: {
            select: { id: true, name: true, image: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!article) {
    notFound();
  }

  const localizedTitle = getLocalizedField(article, "title", locale);
  const localizedExcerpt = getLocalizedField(article, "excerpt", locale);
  const localizedContent = getLocalizedField(article, "content", locale);

  // Dynamic reading time (200 words per minute average)
  const wordCount = localizedContent.trim().split(/\s+/).length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  // Query related stories from the same category
  const relatedArticles = await prisma.article.findMany({
    where: {
      category: article.category,
      published: true,
      NOT: { id: article.id },
    },
    include: {
      author: { select: { name: true } },
      _count: { select: { comments: true } },
    },
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  return (
    <article className="container py-8 max-w-4xl space-y-8">
      {/* Navigation Breadcrumb */}
      <div>
        <Button variant="ghost" size="sm" asChild className="gap-2 -ms-2 text-muted-foreground hover:text-foreground">
          <Link href="/news">
            <ArrowLeft className="h-4 w-4" />
            {t("backToNews")}
          </Link>
        </Button>
      </div>

      {/* Article Header */}
      <header className="space-y-4">
        <div className="flex items-center gap-3">
          <Badge className="px-3 py-0.5 text-xs font-bold tracking-wide">
            {article.category}
          </Badge>
          <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
            <Clock className="h-3.5 w-3.5" /> {formatLocalizedNumber(readingTimeMinutes, locale)} {t("minRead")}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight text-foreground">
          {localizedTitle}
        </h1>

        <p className="text-lg text-muted-foreground leading-relaxed">
          {localizedExcerpt}
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-y">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border">
              <AvatarImage src={article.author.image || undefined} />
              <AvatarFallback className="text-xs font-bold">
                {getInitials(article.author.name || "Author")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-bold text-sm leading-tight text-foreground">
                {article.author.name || "Sports Journalist"}
              </p>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> {formatLocalizedDate(article.createdAt, locale)}
                </span>
                {article.source && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-semibold text-primary">
                      Source:{" "}
                      {article.sourceUrl ? (
                        <a
                          href={article.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline inline-flex items-center gap-1"
                        >
                          {article.source}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        article.source
                      )}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Social Sharing Component */}
          <ShareButtons title={localizedTitle} />
        </div>
      </header>

      {/* Featured Cover Banner */}
      <div className="relative h-72 sm:h-96 md:h-[460px] w-full rounded-2xl overflow-hidden border shadow-lg bg-muted">
        <SafeImage
          src={article.coverImage}
          alt={localizedTitle}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 896px"
          className="object-cover"
        />
      </div>

      {/* Formatted Article Body Typography */}
      <div className="prose prose-neutral dark:prose-invert max-w-none text-base sm:text-lg leading-relaxed space-y-6 text-foreground/90 py-2">
        {localizedContent.split("\n\n").map((paragraph, index) => (
          <p key={index} className="leading-relaxed whitespace-pre-line">
            {paragraph}
          </p>
        ))}
      </div>

      <Separator className="my-10" />

      {/* Related Articles Discovery Grid */}
      {relatedArticles.length > 0 && (
        <section className="space-y-4 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="text-xl font-bold tracking-tight">
              {t("relatedStories")}
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {relatedArticles.map((rel) => (
              <NewsCard
                key={rel.id}
                item={{
                  id: rel.id,
                  title: getLocalizedField(rel, "title", locale),
                  slug: rel.slug,
                  excerpt: getLocalizedField(rel, "excerpt", locale),
                  category: rel.category,
                  coverImage: rel.coverImage,
                  author: { name: rel.author.name },
                  commentsCount: rel._count.comments,
                  createdAt: formatLocalizedDate(rel.createdAt, locale),
                }}
              />
            ))}
          </div>
        </section>
      )}

      <Separator className="my-6" />

      {/* Interactive Discussion Section */}
      <ArticleComments
        articleId={article.id}
        initialComments={article.comments.map((c) => ({
          id: c.id,
          content: c.content,
          createdAt: c.createdAt,
          user: {
            id: c.user.id,
            name: c.user.name,
            image: c.user.image,
          },
        }))}
      />
    </article>
  );
}
