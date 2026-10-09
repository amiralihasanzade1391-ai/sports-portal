import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getLocalizedField, formatLocalizedDate, formatLocalizedNumber } from "@/lib/i18n-utils";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { NewsCard } from "@/components/news/news-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Newspaper, Search, ChevronLeft, ChevronRight } from "lucide-react";

interface NewsPageProps {
  params: { locale: string };
  searchParams: {
    page?: string;
    category?: string;
    search?: string;
  };
}

export async function generateMetadata({
  params: { locale },
}: NewsPageProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "news" });
  return {
    title: `${t("directoryTitle")} | Sports Portal`,
    description: t("directoryDescription"),
  };
}

export default async function NewsDirectoryPage({
  params: { locale },
  searchParams,
}: NewsPageProps) {
  const t = await getTranslations({ locale, namespace: "news" });
  const tNav = await getTranslations({ locale, namespace: "nav" });
  const tCommon = await getTranslations({ locale, namespace: "common" });

  const currentPage = Math.max(1, parseInt(searchParams.page ?? "1", 10));
  const selectedCategory = searchParams.category ?? "ALL";
  const searchQuery = searchParams.search ?? "";
  const pageSize = 9;

  const categories = [
    { value: "ALL", label: t("allSports") },
    { value: "FOOTBALL", label: "Football" },
    { value: "BASKETBALL", label: "Basketball" },
    { value: "TENNIS", label: "Tennis" },
    { value: "CRICKET", label: "Cricket" },
    { value: "GENERAL", label: "General" },
  ];

  // Where query
  const where = {
    published: true,
    ...(selectedCategory !== "ALL" ? { category: selectedCategory } : {}),
    ...(searchQuery.trim()
      ? {
          OR: [
            { title: { contains: searchQuery.trim() } },
            { titleFa: { contains: searchQuery.trim() } },
            { excerpt: { contains: searchQuery.trim() } },
            { excerptFa: { contains: searchQuery.trim() } },
          ],
        }
      : {}),
  };

  const [articles, totalCount] = await Promise.all([
    prisma.article.findMany({
      where,
      include: {
        author: { select: { name: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    }),
    prisma.article.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const createQueryUrl = (params: { page?: number; category?: string; search?: string }) => {
    const nextParams = new URLSearchParams();
    const p = params.page ?? currentPage;
    const c = params.category ?? selectedCategory;
    const s = params.search !== undefined ? params.search : searchQuery;

    if (p > 1) nextParams.set("page", p.toString());
    if (c !== "ALL") nextParams.set("category", c);
    if (s.trim()) nextParams.set("search", s.trim());

    const qs = nextParams.toString();
    return qs ? `/news?${qs}` : "/news";
  };

  return (
    <div className="container py-8 space-y-6">
      <PageHeader
        title={t("directoryTitle")}
        description={t("directoryDescription")}
        breadcrumbs={[{ label: tNav("news") }]}
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 py-2 border-b pb-6">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.value;
            return (
              <Button
                key={cat.value}
                size="sm"
                variant={isActive ? "default" : "outline"}
                asChild
                className="rounded-full text-xs shrink-0"
              >
                <Link href={createQueryUrl({ category: cat.value, page: 1 })}>
                  {cat.label}
                </Link>
              </Button>
            );
          })}
        </div>

        {/* Search Input Form */}
        <form method="GET" action={`/${locale}/news`} className="relative w-full md:w-72">
          {selectedCategory !== "ALL" && (
            <input type="hidden" name="category" value={selectedCategory} />
          )}
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            name="search"
            defaultValue={searchQuery}
            placeholder={t("searchPlaceholder")}
            className="ps-9 h-9"
          />
        </form>
      </div>

      {/* Articles Grid or Empty State */}
      {articles.length === 0 ? (
        <EmptyState
          icon={Newspaper}
          title={t("noArticles")}
          description={t("noArticlesDesc")}
          actionLabel={t("clearFilters")}
          actionHref="/news"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {articles.map((article) => (
            <NewsCard
              key={article.id}
              item={{
                id: article.id,
                title: getLocalizedField(article, "title", locale),
                slug: article.slug,
                excerpt: getLocalizedField(article, "excerpt", locale),
                category: article.category,
                coverImage: article.coverImage,
                source: article.source,
                sourceUrl: article.sourceUrl,
                author: { name: article.author.name },
                commentsCount: article._count.comments,
                createdAt: formatLocalizedDate(article.createdAt, locale),
              }}
            />
          ))}
        </div>
      )}

      {/* Server Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t pt-6">
          <p className="text-xs text-muted-foreground">
            {tCommon("page")}{" "}
            <span className="font-semibold text-foreground">
              {formatLocalizedNumber(currentPage, locale)}
            </span>{" "}
            {tCommon("of")}{" "}
            <span className="font-semibold text-foreground">
              {formatLocalizedNumber(totalPages, locale)}
            </span>
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              asChild={currentPage > 1}
              className="gap-1 h-8 text-xs"
            >
              {currentPage > 1 ? (
                <Link href={createQueryUrl({ page: currentPage - 1 })}>
                  <ChevronLeft className="h-3.5 w-3.5" /> {tCommon("previous")}
                </Link>
              ) : (
                <>
                  <ChevronLeft className="h-3.5 w-3.5" /> {tCommon("previous")}
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              asChild={currentPage < totalPages}
              className="gap-1 h-8 text-xs"
            >
              {currentPage < totalPages ? (
                <Link href={createQueryUrl({ page: currentPage + 1 })}>
                  {tCommon("next")} <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <>
                  {tCommon("next")} <ChevronRight className="h-3.5 w-3.5" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
