/* ==========================================================
 * Shared TypeScript types & interfaces for the Sports Portal.
 * These mirror Prisma models but are safe to use on the client.
 * ======================================================== */

/** Supported theme modes */
export type Theme = "light" | "dark" | "stadium" | "neon";

/** User roles for authorization */
export type UserRole = "USER" | "ADMIN";

/** Match status enum */
export type MatchStatus =
  | "NOT_STARTED"
  | "FIRST_HALF"
  | "HALF_TIME"
  | "SECOND_HALF"
  | "FINISHED"
  | "POSTPONED"
  | "CANCELLED";

/** Article category enum */
export type ArticleCategory =
  | "FOOTBALL"
  | "BASKETBALL"
  | "TENNIS"
  | "CRICKET"
  | "GENERAL";

// ─── Client-safe data models ─────────────────────────────

export interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: UserRole;
  createdAt: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: ArticleCategory;
  published: boolean;
  author: Pick<User, "id" | "name" | "image">;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  league: string;
  country: string;
  founded: number | null;
  stadium: string | null;
}

export interface Player {
  id: string;
  name: string;
  position: string;
  number: number | null;
  nationality: string;
  image: string;
  team: Pick<Team, "id" | "name" | "logo">;
  goals: number;
  assists: number;
  appearances: number;
}

export interface Match {
  id: string;
  homeTeam: Pick<Team, "id" | "name" | "shortName" | "logo">;
  awayTeam: Pick<Team, "id" | "name" | "shortName" | "logo">;
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus;
  matchDate: string;
  venue: string | null;
  league: string;
  minute: number | null;
}

export interface Comment {
  id: string;
  content: string;
  user: Pick<User, "id" | "name" | "image">;
  articleId: string;
  article?: Pick<Article, "id" | "title" | "slug">;
  createdAt: string;
}

export interface FavoriteTeam {
  id: string;
  userId: string;
  teamId: string;
  team: Team;
}

export interface SiteSettings {
  id: string;
  siteName: string;
  siteDescription: string;
  maintenanceMode: boolean;
  featuredArticleIds: string[];
}

// ─── API response wrappers ────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── Dashboard stats ─────────────────────────────────────

export interface AdminStats {
  totalUsers: number;
  totalArticles: number;
  totalMatches: number;
  totalTeams: number;
  activeMatches: number;
  recentUsers: User[];
}

// ─── Navigation types ─────────────────────────────────────

export interface NavItem {
  title: string;
  href: string;
  icon?: string;
  children?: NavItem[];
  adminOnly?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}
