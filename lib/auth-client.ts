"use client";

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // Используем относительные пути или текущий origin для избежания CORS проблем
  // Всегда используем текущий домен, чтобы работать на любом деплое (production, preview, localhost)
  baseURL: typeof window !== "undefined" ? window.location.origin : (process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000"),
});

export const { signIn, signUp, signOut, useSession, forgetPassword, resetPassword } = authClient;

