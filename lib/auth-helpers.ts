import { auth } from './auth';
import { headers } from 'next/headers';

/**
 * Получить сессию пользователя на сервере (для API routes)
 */
export async function getServerSession() {
  const headersList = await headers();
  return await auth.api.getSession({ headers: headersList });
}

/**
 * Получить текущего пользователя на сервере
 */
export async function getCurrentUser() {
  const session = await getServerSession();
  return session?.user || null;
}

