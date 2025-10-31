"use client";

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useAuthStore } from '@/store/auth-store';

/**
 * Компонент для синхронизации NextAuth session с Zustand store в реальном времени
 * Автоматически обновляет store при изменении сессии NextAuth
 */
export function AuthSyncProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const { setSession, setLoading, clearAuth } = useAuthStore();

  useEffect(() => {
    // Устанавливаем состояние загрузки
    setLoading(status === 'loading');

    // Синхронизируем сессию с store в реальном времени
    if (status !== 'loading') {
      if (session) {
        setSession(session);
      } else {
        // Если сессии нет, очищаем store
        clearAuth();
      }
    }
  }, [session, status, setSession, setLoading, clearAuth]);

  // Дополнительная проверка при монтировании компонента
  useEffect(() => {
    // Периодическая синхронизация (каждые 30 секунд) для проверки истечения сессии
    const syncInterval = setInterval(() => {
      if (status === 'unauthenticated' && session === null) {
        clearAuth();
      }
    }, 30000);

    return () => clearInterval(syncInterval);
  }, [status, session, clearAuth]);

  return <>{children}</>;
}

