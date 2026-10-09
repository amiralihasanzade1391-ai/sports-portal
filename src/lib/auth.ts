import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

/**
 * NextAuth.js Configuration
 *
 * Auth strategy:
 * - CredentialsProvider for email/password login
 * - PrismaAdapter for database-backed sessions & user storage
 * - JWT strategy (required when using Credentials provider)
 * - Role-based access (USER / ADMIN) passed through JWT → session
 *
 * To add OAuth providers (Google, GitHub), uncomment and configure
 * the relevant sections and add client IDs to .env.
 */
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  session: {
    // JWT is required for Credentials provider (no DB sessions)
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: "/login",
    // signUp is not a built-in page, handled by custom /signup route
    error: "/login", // Redirect auth errors to login page
  },

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Validate input exists
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("Invalid email or password");
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid email or password");
        }

        // Return user object (this becomes the JWT payload via callbacks)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),

    // ─── Uncomment to add Google OAuth ──────────────────────
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_CLIENT_ID!,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    // }),

    // ─── Uncomment to add GitHub OAuth ──────────────────────
    // GitHubProvider({
    //   clientId: process.env.GITHUB_CLIENT_ID!,
    //   clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    // }),
  ],

  callbacks: {
    /**
     * JWT callback — runs whenever a JWT is created or updated.
     * We inject the user's `id` and `role` into the token so they
     * are available in the session callback.
     */
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.image) token.picture = session.image;
      }
      return token;
    },

    /**
     * Session callback — runs whenever a session is checked.
     * We copy `id` and `role` from the JWT token into the session
     * object so they are available on the client via useSession().
     */
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        if (token.name) session.user.name = token.name;
        if (token.picture) session.user.image = token.picture;
      }
      return session;
    },
  },
};

// ─── Type Augmentations ────────────────────────────────────
// Extend NextAuth types to include our custom fields (id, role).

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "USER" | "ADMIN";
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "USER" | "ADMIN";
  }
}
