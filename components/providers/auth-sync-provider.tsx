"use client";

import { useEffect } from 'react';
import { authClient } from '@/lib/auth-client';
import { useAuthStore } from '@/store/auth-store';

/**
 * Компонент для синхронизации Better Auth session с Zustand store в реальном времени
 * Автоматически обновляет store при изменении сессии Better Auth
 */
export function AuthSyncProvider({ children }: { children: React.ReactNode }) {
  const { setSession, setLoading, clearAuth, setUser } = useAuthStore();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    // Устанавливаем состояние загрузки
    setLoading(isPending);

    // Синхронизируем сессию с store в реальном времени
    if (!isPending) {
      if (session?.user) {
        setSession({
          user: {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.name || '',
            image: session.user.image || undefined,
          },
          expiresAt: session.session?.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.name || '',
          image: session.user.image || undefined,
        });
      } else {
        // Если сессии нет, очищаем store
        clearAuth();
      }
    }
  }, [session, isPending, setSession, setLoading, clearAuth, setUser]);

  return <>{children}</>;
}
