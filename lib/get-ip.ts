import { NextRequest } from 'next/server';

/**
 * Получить IP-адрес клиента из запроса
 * Поддерживает Next.js 16 и прокси/load balancer
 */
export function getClientIp(request: NextRequest): string {
  // Проверяем x-forwarded-for (для прокси)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    // Может содержать несколько IP через запятую, берем первый
    const ips = forwarded.split(',').map(ip => ip.trim());
    return ips[0] || 'anonymous';
  }

  // Проверяем x-real-ip (альтернативный заголовок)
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Если ничего не найдено, возвращаем anonymous
  return 'anonymous';
}

