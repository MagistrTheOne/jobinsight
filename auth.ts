import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { compare, hash } from "bcryptjs";
import { db } from "@/lib/db";
import { users, accounts, sessions, verificationTokens } from "@/lib/db/schema";
import { getUserByEmail, createUser } from "@/lib/db/queries";

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db, {
    usersTable: users as any,
    accountsTable: accounts as any,
    sessionsTable: sessions as any,
    verificationTokensTable: verificationTokens as any,
  }),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Поиск пользователя в БД
        const user = await getUserByEmail(credentials.email);
        if (!user || !user.password) {
          return null;
        }

        // Проверка пароля
        const isValid = await compare(credentials.password, user.password);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name || undefined,
          image: user.image || undefined,
        };
      }
    })
  ],
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  callbacks: {
    async session({ session, user }) {
      // Для database strategy, user передается в session callback
      if (session.user && user) {
        (session.user as any).id = user.id;
      }
      return session;
    },
  },
  session: {
    strategy: "database", // Используем database strategy с Drizzle адаптером
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key-change-in-production",
};

// Хелпер функция для регистрации пользователей (для Credentials провайдера)
export async function registerUser(email: string, name: string, password: string) {
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await hash(password, 12);
  const userId = crypto.randomUUID();

  const newUser = await createUser({
    id: userId,
    email,
    name,
    password: hashedPassword,
  });

  return newUser;
}

