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
          const { createdAt, updatedAt, emailVerified, ...userData } = user as any;
          
          // Handle emailVerified: convert to Date if string, set to null if undefined
          const processedData: any = { ...userData };
          if (emailVerified !== undefined && emailVerified !== null) {
            try {
              processedData.emailVerified = emailVerified instanceof Date 
                ? emailVerified 
                : new Date(emailVerified);
              // Validate date
              if (isNaN(processedData.emailVerified.getTime())) {
                processedData.emailVerified = null;
              }
            } catch {
              processedData.emailVerified = null;
            }
          } else {
            processedData.emailVerified = null;
          }
          
          return {
            data: processedData,
          };
        },
      },
    },
    account: {
      create: {
        before: async (account, ctx) => {
          // Exclude createdAt and updatedAt - let DB handle with defaultNow()
          const { createdAt, updatedAt, expiresAt, ...accountData } = account as any;
          
          // Handle expiresAt: convert to Date if string, set to null if undefined
          const processedData: any = { ...accountData };
          if (expiresAt !== undefined && expiresAt !== null) {
            try {
              processedData.expiresAt = expiresAt instanceof Date 
                ? expiresAt 
                : new Date(expiresAt);
              // Validate date
              if (isNaN(processedData.expiresAt.getTime())) {
                processedData.expiresAt = null;
              }
            } catch {
              processedData.expiresAt = null;
            }
          } else {
            processedData.expiresAt = null;
          }
          
          return {
            data: processedData,
          };
        },
      },
    },
    session: {
      create: {
        before: async (session, ctx) => {
          // Exclude createdAt and updatedAt - let DB handle with defaultNow()
          const { createdAt, updatedAt, expiresAt, ...sessionData } = session as any;
          
          // Handle expiresAt: must be Date object
          const processedData: any = { ...sessionData };
          if (expiresAt !== undefined && expiresAt !== null) {
            try {
              processedData.expiresAt = expiresAt instanceof Date 
                ? expiresAt 
                : new Date(expiresAt);
              // Validate date
              if (isNaN(processedData.expiresAt.getTime())) {
                throw new Error('Invalid expiresAt date');
              }
            } catch (error) {
              console.error('Error processing session expiresAt:', error);
              throw error; // Session must have valid expiresAt
            }
          }
          
          return {
            data: processedData,
          };
        },
      },
    },
    verification: {
      create: {
        before: async (verification, ctx) => {
          // Exclude createdAt and updatedAt - let DB handle with defaultNow()
          const { createdAt, updatedAt, expiresAt, ...verificationData } = verification as any;
          
          // Handle expiresAt: must be Date object
          const processedData: any = { ...verificationData };
          if (expiresAt !== undefined && expiresAt !== null) {
            try {
              processedData.expiresAt = expiresAt instanceof Date 
                ? expiresAt 
                : new Date(expiresAt);
              // Validate date
              if (isNaN(processedData.expiresAt.getTime())) {
                throw new Error('Invalid expiresAt date');
              }
            } catch (error) {
              console.error('Error processing verification expiresAt:', error);
              throw error; // Verification must have valid expiresAt
            }
          }
          
          return {
            data: processedData,
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
  // Автоматическое определение baseURL:
  // 1. BETTER_AUTH_URL (если явно указан)
  // 2. VERCEL_URL (автоматически на Vercel для всех деплоев - production, preview, branch)
  // 3. NEXTAUTH_URL (fallback)
  // 4. undefined (Better Auth определит из request headers)
  baseURL: process.env.BETTER_AUTH_URL || 
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ||
    process.env.NEXTAUTH_URL || 
    undefined,
  basePath: "/api/auth",
});

export type Session = typeof auth.$Infer.Session;
