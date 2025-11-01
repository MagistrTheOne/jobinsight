"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Динамический импорт клиентского компонента синхронизации
// Это гарантирует, что useSession hook будет вызываться только на клиенте
const AuthSyncClient = dynamic(
  () => import('./auth-sync-client').then(mod => ({ default: mod.AuthSyncClient })),
  { ssr: false }
);

/**
 * Провайдер для синхронизации Better Auth session с Zustand store
 * Использует динамический импорт для предотвращения SSR ошибок
 */
export function AuthSyncProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuthSyncClient />
      {children}
    </>
  );
}
