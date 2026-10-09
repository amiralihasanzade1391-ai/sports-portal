"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

/**
 * Auth Provider
 *
 * Wraps the application with NextAuth's SessionProvider so that
 * useSession(), signIn(), and signOut() work throughout the app.
 *
 * This must be a client component because SessionProvider uses
 * React Context internally.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
