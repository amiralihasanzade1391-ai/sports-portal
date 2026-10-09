import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const handleI18nRouting = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Run next-intl routing
  const response = handleI18nRouting(request);

  // 2. Extract locale and pathname without locale prefix
  const pathnameWithoutLocale = pathname.replace(/^\/(en|fa)/, "") || "/";
  const localeMatch = pathname.match(/^\/(en|fa)/);
  const currentLocale = localeMatch ? localeMatch[1] : routing.defaultLocale;

  // 3. Retrieve JWT session token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthenticated = !!token;
  const isAdmin = token?.role === "ADMIN";

  // Auth pages: redirect authenticated users to dashboard
  if (
    pathnameWithoutLocale.startsWith("/login") ||
    pathnameWithoutLocale.startsWith("/signup")
  ) {
    if (isAuthenticated) {
      return NextResponse.redirect(
        new URL(`/${currentLocale}/dashboard`, request.url)
      );
    }
    return response;
  }

  // Dashboard: require authentication
  if (pathnameWithoutLocale.startsWith("/dashboard")) {
    if (!isAuthenticated) {
      const loginUrl = new URL(`/${currentLocale}/login`, request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return response;
  }

  // Admin: require authentication + ADMIN role
  if (pathnameWithoutLocale.startsWith("/admin")) {
    if (!isAuthenticated) {
      const loginUrl = new URL(`/${currentLocale}/login`, request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (!isAdmin) {
      return NextResponse.redirect(
        new URL(`/${currentLocale}/dashboard`, request.url)
      );
    }
    return response;
  }

  return response;
}

export const config = {
  // Match only internationalized pathnames, skipping /api, static files, and _next
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
