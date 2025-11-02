import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import { users, sessions, accounts, verifications } from "./db/schema";
import bcrypt from "bcryptjs";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      users: users,
      sessions: sessions,
      accounts: accounts,
      verifications: verifications,
    },
    usePlural: true,
  }),
  databaseHooks: {
    user: {
      create: {
        before: async (user, ctx) => {
          // Exclude createdAt and updatedAt - let DB handle with defaultNow()
          const { createdAt, updatedAt, ...userData } = user as any;
          return {
            data: userData,
          };
        },
      },
    },
    account: {
      create: {
        before: async (account, ctx) => {
          // Exclude createdAt and updatedAt - let DB handle with defaultNow()
          const { createdAt, updatedAt, ...accountData } = account as any;
          return {
            data: accountData,
          };
        },
      },
    },
    session: {
      create: {
        before: async (session, ctx) => {
          // Exclude createdAt and updatedAt - let DB handle with defaultNow()
          const { createdAt, updatedAt, ...sessionData } = session as any;
          return {
            data: sessionData,
          };
        },
      },
    },
    verification: {
      create: {
        before: async (verification, ctx) => {
          // Exclude createdAt and updatedAt - let DB handle with defaultNow()
          const { createdAt, updatedAt, ...verificationData } = verification as any;
          return {
            data: verificationData,
          };
        },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    password: {
      hash: async (password: string) => {
        return await bcrypt.hash(password, 10);
      },
      verify: async ({ password, hash }: { password: string; hash: string }) => {
        if (!password || !hash) {
          console.error('Password verification failed: missing password or hash', { password: !!password, hash: !!hash });
          return false;
        }
        try {
          return await bcrypt.compare(password, hash);
        } catch (error) {
          console.error('Password verification error:', error);
          return false;
        }
      },
    },
    sendResetPassword: async ({ user, url, token }, request) => {
      // TODO: Implement email sending service (e.g., Resend, SendGrid, etc.)
      // For now, log the reset link (in production, send via email service)
      console.log(`Password reset for ${user.email}`);
      console.log(`Reset URL: ${url}`);
      console.log(`Token: ${token}`);
      
      // In production, you should use an email service:
      // await sendEmail({
      //   to: user.email,
      //   subject: "Reset your password",
      //   html: `<p>Click the link to reset your password: <a href="${url}">${url}</a></p>`,
      // });
    },
    onPasswordReset: async ({ user }, request) => {
      console.log(`Password reset successful for user: ${user.email}`);
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    },
  },
  secret: process.env.BETTER_AUTH_SECRET || "",
  // baseURL может быть не указан - Better Auth попытается определить автоматически из request headers
  // Для production лучше указать BETTER_AUTH_URL, но это не критично если есть fallback
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXTAUTH_URL || undefined,
  basePath: "/api/auth",
});

export type Session = typeof auth.$Infer.Session;
