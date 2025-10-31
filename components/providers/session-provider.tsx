"use client";

import { ReactNode } from "react";
import { AuthSyncProvider } from "./auth-sync-provider";

interface SessionProviderProps {
  children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  return (
    <AuthSyncProvider>{children}</AuthSyncProvider>
  );
}
