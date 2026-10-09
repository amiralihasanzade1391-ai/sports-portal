import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * NextAuth.js API Route Handler (App Router)
 *
 * This catch-all route handles all authentication endpoints:
 * - GET  /api/auth/signin
 * - POST /api/auth/signin
 * - GET  /api/auth/signout
 * - POST /api/auth/signout
 * - GET  /api/auth/session
 * - GET  /api/auth/csrf
 * - GET  /api/auth/providers
 * - GET  /api/auth/callback/:provider
 * - POST /api/auth/callback/:provider
 */
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
